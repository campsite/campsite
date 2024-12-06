# frozen_string_literal: true

module Api
  module V1
    module Posts
      class PostViewsController < PostsBaseController
        skip_before_action :require_authenticated_user, only: [:index, :create]
        skip_before_action :require_authenticated_organization_membership, only: [:index, :create]

        extend Apigen::Controller

        response model: PostViewPageSerializer, code: 200
        request_params do
          {
            after: { type: :string, required: false },
          }
        end
        def index
          authorize(current_post, :show?)

          views = current_post.views
            .counted_reads
            .includes(member: OrganizationMembership::SERIALIZER_EAGER_LOAD)
            .order(updated_at: :desc)

          render_page(PostViewPageSerializer, views, { order: :desc })
        end

        response model: PostViewCreatedSerializer, code: 200
        request_params do
          {
            skip_notifications: { type: :boolean, required: false },
            read: { type: :boolean },
            dwell_time: { type: :integer, required: false },
          }
        end
        def create
          authorize(current_post, :create_view?)

          unless current_organization_membership
            NonMemberPostView.find_or_create_from_request!(
              post: current_post,
              user: current_user,
              remote_ip: client_ip,
              user_agent: request.user_agent,
            )

            return render_json(
              PostViewCreatedSerializer,
              json: {
                view: nil,
                notification_counts: nil,
                project_unread_status: nil,
              },
            )
          end

          # if read param is missing, its an older client that fires views only on reads
          read = params[:read] != false

          user_for_notification_counts = if params[:context] != "inbox" && !params[:skip_notifications] && read
            current_organization_membership.notifications.where(target: current_post, read_at: nil).mark_all_read
            current_user
          end

          view = PostView.upsert_post_view(
            post: current_post,
            member: current_organization_membership,
            read: read,
            dwell_time: params[:dwell_time],
          )

          render_json(
            PostViewCreatedSerializer,
            {
              view: view,
              notification_counts: user_for_notification_counts,
              project_unread_status: current_post.project,
            },
          )
        end
      end
    end
  end
end
