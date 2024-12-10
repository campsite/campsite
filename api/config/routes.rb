# frozen_string_literal: true

require "sidekiq/web"
require "sidekiq-scheduler/web"

Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/preview-emails"
  end

  constraints subdomain: ENV.fetch("AUTH_SUBDOMAIN", "auth") do
    devise_for :users,
      controllers: {
        omniauth_callbacks: "users/omniauth_callbacks",
      },
      path: "",
      path_names: { sign_up: "sign-up", sign_in: "sign-in", sign_out: "sign-out" },
      skip: [:confirmations, :registrations, :sessions]

    devise_scope :user do
      # registrations
      get "/sign-up", to: "users/registrations#new", as: :new_user_registration
      post "/", to: "users/registrations#create", as: :user_registration
      # confirmations
      get "/confirmation", to: "users/confirmations#show", as: :user_confirmation
      # sessions
      get "/sign-in", to: "users/sessions#new", as: :new_user_session
      post "/sign-in", to: "users/sessions#create", as: :user_session
      get "/desktop/sign-in", to: "users/sessions#desktop", as: :desktop_session
      get "/sign-in/otp", to: "users/otp/sessions#new"
      post "/sign-in/otp", to: "users/otp/sessions#create"
      get "/sign-in/recovery-code", to: "users/recovery_code/sessions#new"
      post "/sign-in/recovery-code", to: "users/recovery_code/sessions#create"
      get "/sign-in/sso", to: "users/sso/sessions#new"
      post "/sign-in/sso", to: "users/sso/sessions#create"
      get "/sign-in/sso/callback", to: "users/sso/sessions#callback"
    end

    get "/", to: redirect("/sign-in"), as: :auth_root
    get "/sign-in/desktop", to: "users/desktop/sessions#new", as: :new_desktop_session
    get "/sign-in/desktop/open", to: "users/desktop/sessions#show", as: :open_desktop_session
    post "/sign-in/figma", to: "users/figma/sessions#create", as: :create_figma_session
    get "/sign-in/figma/open", to: "users/figma/sessions#show", as: :open_figma_session
    get "/sign-in/sso/reauthorize", to: "users/sso/reauthorize_sessions#show", as: :reauthorize_sso_sessions

    use_doorkeeper do
      skip_controllers :applications
      controllers authorizations: "doorkeeper/custom_authorizations"
    end

    namespace :integrations do
      resource :auth, only: :new
    end
  end

  constraints subdomain: "admin" do
    scope module: "admin", path: "admin" do
      authenticate :user, lambda { |u| u.staff? } do
        mount Sidekiq::Web => "/sidekiq"
      end

      get "/", to: "admin#index", as: "admin"

      scope module: "features" do
        resources :features, only: [:index, :create, :destroy, :show], param: :name do
          resources :users, only: [:create, :destroy]
          resource :user_search, only: [:show]
          resources :organizations, only: [:create, :destroy], param: :slug
          resource :organization_search, only: [:show]
          resources :actors, only: [:destroy]
          resources :groups, only: [:create, :destroy], param: :name
          resource :enablement, only: [:create, :destroy]

          resources :logs, only: [] do
            resource :rollback, only: [:create]
          end
        end
      end

      scope module: "demo_orgs" do
        resources :demo_orgs, only: [:index, :create]
      end
    end

    get "/", to: redirect("/admin")
  end

  scope module: "api/v1", path: "v1", defaults: { format: :json } do
    # allows organizations to be used as an authorization scope for oauth access tokens
    devise_for :organizations, skip: :all

    get "/organization-by-token/:token", to: "public_organizations#show", as: :public_organization
    post "/organizations", to: "organizations#create"

    resources :public_projects, only: [:show], param: :token

    # sso webhooks
    post "/organizations/sso/webhooks", to: "organizations/sso_webhooks#create", as: :organizations_sso_webhooks

    resources :image_urls, only: :create

    resources :organization_memberships, only: [:index] do
      collection do
        resource :reorder, only: [:update], controller: "organization_memberships/reorders", as: :reorder_organization_memberships
      end
    end

    scope "/organizations/:org_slug", as: :organization do
      get "/", to: "organizations#show"
      patch "/", to: "organizations#update"
      put "/", to: "organizations#update"
      put "/reset-invite-token", to: "organizations#reset_invite_token", as: :reset_invite_token
      patch "/reset-invite-token", to: "organizations#reset_invite_token"
      delete "/", to: "organizations#destroy"
      post "/join/:token", to: "organizations#join", as: :join
      put "/onboard", to: "organizations#onboard", as: :onboard_organization
      get "/avatar/presigned-fields", to: "organizations#avatar_presigned_fields", as: :avatar_presigned_fields
      # enable/disable sso
      post "/sso", to: "organizations/sso#create", as: :sso
      delete "/sso", to: "organizations/sso#destroy"
      # configure sso
      post "/sso/configuration", to: "organizations/sso_configuration#create", as: :sso_configuration

      get "/invitations", to: "organization_invitations#index", as: :invitations
      post "/invitations", to: "organization_invitations#create"
      get "/invitations/:invite_token", to: "organization_invitations#show", as: :invitation
      # DEPRECATED: Use POST /invitations_by_token/:invite_token/accept instead
      post "/invitations/:id/accept", to: "organization_invitations#accept", as: :accept_invitation
      delete "/invitations/:id", to: "organization_invitations#destroy"

      # Notifications
      get "/members/me/notifications", to: "notifications#index", as: :notifications
      delete "/members/me/notifications/:id", to: "notifications#destroy", as: :notification
      post "/members/me/notifications/:notification_id/read", to: "notifications/reads#create", as: :notification_read
      delete "/members/me/notifications/:notification_id/read", to: "notifications/reads#destroy"
      post "/members/me/notifications/mark_all_read", to: "notifications/mark_all_reads#create", as: :notification_mark_all_read
      post "/members/me/notifications/delete_all", to: "notifications/delete_all#create", as: :notification_delete_all

      namespace :organization_memberships, path: "members", as: :membership do
        scope "me" do
          resource :index_views, only: [:update]
          resource :slack_notification_preference, only: [:show, :create, :destroy]
          resource :statuses, only: [:create, :update, :destroy] do
            get :index
          end
          resources :viewer_posts, only: [:index]
          resources :viewer_notes, only: [:index]
          resources :for_me_posts, only: [:index]
          resources :for_me_notes, only: [:index]
          resources :personal_draft_posts, only: [:index]
          resource :personal_call_room, only: [:show]
          resources :archived_notifications, only: [:index]
          resource :data_export, only: [:create]
        end
      end

      scope "members/me" do
        resources :notifications, only: [] do
          resource :archive, only: [:destroy], controller: "notifications/archives"
        end
      end

      resources :members, only: [:index, :show], param: :username, controller: "organization_members" do
        resources :project_memberships, only: [:index], controller: "organization_memberships/project_memberships"
        resource :project_membership_list, only: [:update], controller: "organization_memberships/project_membership_lists"
      end

      resource :invitation_url, only: [:show]

      get "/members/:username/posts", to: "organization_members#posts", as: :member_posts
      patch "/members/:id", to: "organization_members#update"
      put "/members/:id", to: "organization_members#update"
      patch "/members/:id/reactivate", to: "organization_members#reactivate", as: :member_reactivate
      put "/members/:id/reactivate", to: "organization_members#reactivate"
      delete "/members/:id", to: "organization_members#destroy"

      get "/membership-requests", to: "organization_membership_requests#index", as: :membership_requests
      get "/membership-request", to: "organization_membership_requests#show", as: :membership_request
      post "/membership-requests", to: "organization_membership_requests#create"
      post "/membership-requests/:id/approve", to: "organization_membership_requests#approve", as: :approve_membership_request
      post "/membership-requests/:id/decline", to: "organization_membership_requests#decline", as: :decline_membership_request

      # posts
      get "/posts", to: "posts#index", as: :posts
      get "/posts/presigned-fields", to: "posts#presigned_fields", as: :post_presigned_fields
      post "/posts", to: "posts#create"
      get "/posts/:post_id", to: "posts#show", as: :post
      patch "/posts/:post_id", to: "posts#update"
      put "/posts/:post_id", to: "posts#update"
      delete "/posts/:post_id", to: "posts#destroy"

      # post subscriptions
      post "/posts/:post_id/subscribe", to: "posts#subscribe", as: :post_subscribe
      delete "/posts/:post_id/unsubscribe", to: "posts#unsubscribe", as: :post_unsubscribe

      # post feedback requests
      post "/posts/:post_id/feedback_requests", to: "posts/post_feedback_requests#create", as: :post_feedback_requests
      delete "/posts/:post_id/feedback_requests/:id", to: "posts/post_feedback_requests#destroy", as: :post_feedback_request
      post "/posts/:post_id/feedback-dismissals", to: "posts/feedback_dismissals#create", as: :post_feedback_dismissals

      # post reactions
      post "/posts/:post_id/reactions", to: "posts/post_reactions#create", as: :post_reactions

      # post views
      get "/posts/:post_id/views", to: "posts/post_views#index", as: :post_views
      post "/posts/:post_id/views", to: "posts/post_views#create"

      # post comments
      get "/posts/:post_id/comments", to: "posts/post_comments#index", as: :post_comments
      post "/posts/:post_id/comments", to: "posts/post_comments#create"
      # TODO: replace #create with #create2 once front-end is switched and desktop clients update
      post "/posts/:post_id/comments2", to: "posts/post_comments#create", as: :post_comments2

      # post canvas comments
      get "/posts/:post_id/canvas_comments", to: "posts/post_canvas_comments#index", as: :post_canvas_comments

      resources :posts, only: [] do
        resources :feedback_requests, only: [] do
          resource :dismissal, only: [:create], controller: "posts/post_feedback_requests_dismissal"
        end
        resource :poll2, only: [:create, :update, :destroy], controller: "posts/polls2" do
          resources :options, only: [] do
            resource :vote, only: [:create], controller: "posts/polls/votes"
          end
        end
        resource :reorder, only: [:update], controller: "posts/attachments/reorders", as: :attachment_reorder, path: "attachments/reorder"
        resources :attachments, only: [:create, :update, :destroy], controller: "posts/attachments" do
          resources :comments, only: [:index], controller: "posts/attachments/comments"
        end
        resources :links, only: [:create], controller: "posts/post_links"
        resource :seo_info, only: [:show], controller: "posts/seo_infos"
        resource :resolution, only: [:create, :destroy], controller: "posts/resolutions"
        resource :favorite, only: [:create, :destroy], controller: "posts/favorites"
        resource :pin, only: [:create], controller: "posts/pins"
        resource :generated_resolution, only: [:show], controller: "posts/generated_resolutions"
        resource :generated_tldr, only: [:show], controller: "posts/generated_tldrs"
        resources :timeline_events, only: [:index], controller: "posts/timeline_events"
        resources :linear_timeline_events, only: [:index], controller: "posts/linear_timeline_events"
        resources :linear_issues, only: [:create], controller: "posts/linear_issues"
      end

      resources :figma_file_attachment_details, only: [:create]

      resources :attachments, only: [:create, :show] do
        scope module: :attachments do
          resources :commenters, only: [:index]
        end
      end

      namespace :figma do
        resources :files, only: [:create]
      end

      resources :threads, only: [:index, :create, :show, :update, :destroy], controller: "message_threads" do
        collection do
          resource :presigned_fields, only: [:show], controller: "message_threads/presigned_fields", as: :thread_presigned_fields, path: "presigned-fields"
          resources :dms, only: [:show], param: :username, controller: "message_threads/dms"
          resources :integration_dms, only: [:show], param: :oauth_application_id, controller: "message_threads/integration_dms"
        end

        resources :messages, only: [:index, :create, :update, :destroy], controller: "message_threads/messages"
        resource :reads, only: [:create, :destroy], controller: "message_threads/reads"
        resource :other_memberships_list, only: [:update], controller: "message_threads/other_memberships_lists"
        resource :my_membership, only: [:show, :update, :destroy], controller: "message_threads/my_memberships"
        resource :favorites, only: [:create, :destroy], controller: "message_threads/favorites"
        resources :integrations, only: [:index, :create, :destroy], controller: "message_threads/integrations"
        resources :oauth_applications, only: [:index, :create, :destroy], controller: "message_threads/oauth_applications"
        resources :notification_forces, only: [:create], controller: "message_threads/notification_forces"
      end

      resources :messages, only: [] do
        resources :attachments, only: [:destroy], controller: "messages/attachments"
        resources :reactions, only: [:create], controller: "messages/reactions"
      end

      resources :calls, only: [:index, :show, :update] do
        scope module: :calls do
          resources :recordings, only: [:index]
          resource :all_recordings, only: [:destroy]
          resource :project_permission, only: [:update, :destroy]
          resource :pin, only: [:create]
          resource :favorite, only: [:create, :destroy]
          resource :follow_up, only: [:create]
        end
      end

      resources :call_recordings, only: [] do
        resource :transcription, only: [:show], controller: "call_recordings/transcriptions"
      end

      resources :call_rooms, only: [:show, :create] do
        scope module: :call_rooms do
          resources :invitations, only: [:create]
        end
      end

      resources :comments, only: [:show, :update, :destroy] do
        scope module: :comments do
          resource :tasks, only: [:update]
          resources :reactions, only: [:create]
          resources :replies, only: [:create]
          resource :resolutions, only: [:create, :destroy]
          resource :follow_up, only: [:create]
          resources :linear_issues, only: [:create]
          resource :reorder, only: [:update], controller: "attachments/reorders", as: :attachment_reorder, path: "attachments/reorder"
        end
      end

      # post versions
      get "/posts/:post_id/versions", to: "posts/post_versions#index", as: :post_versions
      post "/posts/:post_id/versions", to: "posts/post_versions#create"

      resources :posts, only: [] do
        scope module: :posts do
          resource :status, only: [:update]
          resources :shares, only: [:create]
          resource :visibility, only: [:update]
          resource :tasks, only: [:update]
          resource :follow_up, only: [:create]
          resource :publication, only: [:create]

          resources :poll_options, only: [] do
            resources :voters, only: [:index]
          end
        end
      end

      resources :notes, only: [:index, :create, :show, :update, :destroy] do
        scope module: :notes do
          resources :comments, only: [:index, :create]
          resources :permissions, only: [:index, :create, :update, :destroy]
          resources :views, only: [:index, :create]
          resource :visibility, only: [:update]
          resource :public_notes, only: [:show]
          resource :project_permissions, only: [:update, :destroy]
          resource :sync_state, only: [:show, :update]
          resource :follow_up, only: [:create]
          resource :favorite, only: [:create, :destroy]
          resource :pin, only: [:create]
          resource :reorder, only: [:update], controller: "attachments/reorders", as: :attachment_reorder, path: "attachments/reorder"
          resources :attachments, only: [:create, :update, :destroy] do
            scope module: :attachments do
              resources :comments, only: [:index]
            end
          end
          resources :timeline_events, only: [:index]
        end
      end

      # projects
      get "/projects", to: "projects#index", as: :projects
      post "/projects", to: "projects#create"
      get "/project/cover-photo/presigned-fields", to: "projects#cover_photo_presigned_fields", as: :project_cover_photo_presigned_fields
      get "/projects/:project_id", to: "projects#show", as: :project
      patch "/projects/:project_id", to: "projects#update"
      put "/projects/:project_id", to: "projects#update"
      delete "/projects/:project_id", to: "projects#destroy"
      put "/projects/:project_id/archive", to: "projects#archive", as: :archive_project
      patch "/projects/:project_id/archive", to: "projects#archive"
      put "/projects/:project_id/unarchive", to: "projects#unarchive", as: :unarchive_project
      patch "/projects/:project_id/unarchive", to: "projects#unarchive"

      # project bookmarks
      get "/projects/:project_id/bookmarks", to: "projects/bookmarks#index", as: :project_bookmarks
      post "/projects/:project_id/bookmarks", to: "projects/bookmarks#create"
      put "/projects/:project_id/bookmarks/reorder", to: "projects/bookmarks#reorder", as: :project_bookmarks_reorder
      put "/projects/:project_id/bookmarks/:id", to: "projects/bookmarks#update", as: :project_bookmark
      patch "/projects/:project_id/bookmarks/:id", to: "projects/bookmarks#update"
      delete "/projects/:project_id/bookmarks/:id", to: "projects/bookmarks#destroy"

      resource :sync, only: [] do
        scope module: :sync do
          resources :projects, only: [:index]
          resources :tags, only: [:index]
          resources :members, only: [:index]
          resources :message_threads, only: [:index]
          resources :custom_reactions, only: [:index]
        end
      end

      resources :projects, only: [] do
        scope module: :projects do
          resource :favorites, only: [:create, :destroy]
          resource :memberships, only: [:create, :destroy], as: :project_memberships
          resource :subscription, only: [:create, :destroy]
          resources :oauth_applications, only: [:index, :create, :destroy]
          resources :members, only: [:index]
          resources :addable_members, only: [:index]
          resource :views, only: [:create]
          resource :reads, only: [:create, :destroy]
          resources :notes, only: [:index]
          resources :pins, only: [:index]
          resources :posts, only: [:index]
          resources :calls, only: [:index]
          resource :invitation_url, only: [:create, :show]
          resources :invitation_url_acceptances, only: [:create]
          resource :display_preferences, only: [:update]
          resource :viewer_display_preferences, only: [:update, :destroy]
          resource :data_exports, only: [:create]
        end
      end

      # project memberships
      resources :project_memberships, only: [:index] do
        collection do
          resource :reorders, only: [:update], as: :project_memberships_reorders, controller: "project_memberships/reorders", path: "reorder"
        end
      end

      # tags
      get "/tags", to: "tags#index", as: :tags
      post "/tags", to: "tags#create"
      get "/tags/:tag_name", to: "tags#show", as: :tag
      put "/tags/:tag_name", to: "tags#update"
      patch "/tags/:tag_name", to: "tags#update"
      delete "/tags/:tag_name", to: "tags#destroy"
      get "/tags/:tag_name/posts", to: "tags#posts", as: :tag_posts

      # slack integration
      get "/integrations/slack/callback", to: "integrations/slack/organization_installation_callbacks#show", as: :slack_integration_callback
      get "/integrations/slack", to: "slack_integrations#show", as: :slack_integration
      delete "/integrations/slack", to: "slack_integrations#destroy"

      namespace :integrations do
        namespace :slack do
          resource :notifications_callback, only: [:show]
          resources :channels, only: [:index, :show], controller: "channels", param: :provider_channel_id
          resources :channel_syncs, only: [:create]
        end

        namespace :linear do
          get "installation", to: "installation#show", as: :installation
          delete "installation", to: "installation#destroy"

          resources :teams, only: [:index]
          resources :team_syncs, only: [:create]
        end
      end

      # favorites
      resources :favorites, only: [:index, :destroy] do
        collection do
          put :reorder, to: "favorites/reorders#update"
        end
      end

      resources :pins, only: [:destroy]
      resources :onboard_projects, only: [:create]
      resources :activity_views, only: [:create]

      # feedback
      post "/feedback", to: "feedbacks#create", as: :feedbacks
      get "/feedback/presigned-fields", to: "feedbacks#presigned_fields", as: :feedbacks_presigned_fields

      # DEPRECATED: digests
      resources :digests, only: [] do
        resource :migrations, only: [:show], controller: "digests/migrations"
      end

      namespace :search do
        resources :groups, only: [:index]
        resources :posts, only: [:index]
        resources :mixed, only: [:index]
        resources :resource_mentions, only: [:index]
      end

      resources :features, only: [:index], controller: "organizations/features"
      resources :bulk_invites, only: [:create], controller: "organizations/bulk_invites"
      resources :verified_domain_memberships, only: [:create], controller: "organizations/verified_domain_memberships"

      resource :resource_mentions, only: [:show]

      resource :reactions, only: [:destroy]
      resources :custom_reactions, only: [:index, :create, :destroy]
      namespace :custom_reactions do
        resources :packs, only: [:index, :create, :destroy], param: :name
      end

      resources :follow_ups, only: [:index, :update, :destroy]

      resources :gifs, only: [:index]

      resources :oauth_applications, only: [:index, :create, :show, :update, :destroy] do
        resources :secret_renewals, only: [:create], controller: "oauth_applications/secret_renewals"
        resources :tokens, only: [:create], controller: "oauth_applications/tokens"
        collection do
          resource :presigned_fields, only: [:show], controller: "oauth_applications/presigned_fields", as: :oauth_application_presigned_fields
        end
      end

      resources :data_exports, only: [:create]
    end

    # slack ack endpoint
    post "/integrations/slack/ack", to: "slack_integrations#ack", as: :slack_integration_ack

    resources :product_logs, only: [:create], to: "product_logs#create"
    resources :batched_post_views, only: [:create], to: "batched_post_views#create"

    get "/notes/:note_id/thumbnails/:hash/:width/:theme", to: "notes/thumbnails#show", as: :note_thumbnail

    get "/post_note_open_graph_images/:post_id/:hash", to: "post_note_open_graph_images#show", as: :post_note_open_graph_image

    namespace :integrations, as: nil do
      namespace :slack, as: :slack_integration do
        resource :events, only: [:create]
      end

      resource :figma_integration, only: [:show]
      namespace :figma, as: :figma_integration do
        resource :callback, only: [:show]
      end

      namespace :hms, as: :hms_integration do
        resources :events, only: [:create]
      end

      namespace :zapier, as: :zapier_integration do
        resource :callback, only: [:show]
        resources :comments, only: [:create]
        resources :messages, only: [:create]
        resources :posts, only: [:create]
        resources :projects, only: [:index]
      end

      namespace :google do
        resources :calendar_events, only: [:create]
        resource :calendar_integration, only: [:show]
        resource :calendar_events_organization, only: [:update]
      end

      namespace :cal_dot_com do
        resources :call_rooms, only: [:create]
        resource :integration, only: [:show]
        resource :organization, only: [:update]
      end

      namespace :linear, as: :linear_integration do
        resource :callback, only: [:show]
        resources :webhooks, only: [:create]
      end
    end

    namespace :pusher do
      resources :auths, only: [:create], path: "auth"
    end

    get "/users/me", to: "users#me", as: :current_user
    put "/users/me", to: "users#update"
    put "/users/me/onboard", to: "users#onboard", as: :onboard_current_user
    patch "/users/me", to: "users#update"
    post "/users/me/send-email-confirmation", to: "users#send_email_confirmation", as: :send_user_confirmation_instructions

    namespace :users do
      scope "/me" do
        resource :preference, only: [:update]
        scope module: :notifications, path: "/notifications" do
          namespace :unread, as: :unread_notifications do
            resource :all_count, only: [:show], controller: "counts"
          end
        end
        resource :timezone, only: [:create]
      end
    end

    post "/push_subscriptions", to: "web_push_subscriptions#create", as: :web_push_subscriptions

    # avatar presigned fields
    get "/users/me/avatar/presigned-fields", to: "users#avatar_presigned_fields", as: :user_avatar_presigned_fields
    get "/users/me/cover-photo/presigned-fields", to: "users#cover_photo_presigned_fields", as: :user_cover_photo_presigned_fields

    # sign out user
    delete "/users/me/sign-out", to: "users/sessions#destroy", as: :sign_out_current_user
    # org invitations
    get "/users/me/suggested-organizations", to: "users/suggested_organizations#index", as: :current_user_suggested_organizations
    get "/users/me/organization-invitations", to: "users/organization_invitations#index", as: :current_user_organization_invitations
    # user scheduled notifications
    get "/users/me/scheduled-notifications", to: "users/scheduled_notifications#index", as: :current_user_scheduled_notifications
    post "/users/me/scheduled-notifications", to: "users/scheduled_notifications#create"
    put "/users/me/scheduled-notifications/:id", to: "users/scheduled_notifications#update", as: :current_user_scheduled_notification
    delete "/users/me/scheduled-notifications/:id", to: "users/scheduled_notifications#destroy"
    # user two factor authentication
    post "/users/me/two-factor-authentication", to: "users/two_factor_authentication#create", as: :current_user_two_factor_authentication
    put "/users/me/two-factor-authentication", to: "users/two_factor_authentication#update"
    delete "/users/me/two-factor-authentication", to: "users/two_factor_authentication#destroy"
    post "/users/me/two-factor-authentication/recovery-codes", to: "users/two_factor_authentication/recovery_codes#create", as: :current_user_two_factor_authentication_recovery_codes

    # editor sync token generation
    post "/users/me/sync-token", to: "users/editor_sync_tokens#create", as: :current_user_editor_sync_tokens

    namespace :users do
      scope "me" do
        resource :notification_pause, only: [:create, :destroy]
        resource :notification_schedule, only: [:show, :update, :destroy]
      end
    end

    post "/invitations_by_token/:invite_token/accept", to: "organization_invitations#accept", as: :accept_invitation_by_token

    devise_scope :user do
      post "/sign-in/desktop", to: "users/desktop_sessions#create", as: :internal_desktop_session
    end

    resource :open_graph_links, only: [:show]
    resources :data_export_callbacks, only: [:update]
  end

  # Adds OAuth routes to the V2 API.
  # This errors if used in a `scope` block so we use the `scope` option on `use_doorkeeper` instead.
  use_doorkeeper scope: "v2/oauth" do
    skip_controllers :applications, :authorized_applications

    controllers authorizations: "doorkeeper/custom_authorizations"

    # These are completely omitted when using `scope` so we need to set them explicitly.
    as authorizations: "v2_authorizations",
      tokens: "v2_tokens"
  end

  scope module: "api/v2", path: "v2", as: "v2", defaults: { format: :json } do
    resources :posts, only: [:index, :create, :show] do
      resources :comments, only: [:index, :create], module: :posts
      resource :resolution, only: [:create, :destroy], module: :posts
    end

    resources :members, only: [:index] do
      resources :messages, only: [:create], module: :members
    end

    resources :channels, only: [:index], controller: "projects"

    resources :threads, only: [:create] do
      resources :messages, only: [:index, :create], module: :threads
    end

    match "*path", to: "base#not_found", via: :all
  end
end
