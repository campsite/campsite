# frozen_string_literal: true

class OrganizationSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :avatar_url
  api_field :avatar_urls, blueprint: AvatarUrlsSerializer
  api_field :created_at
  api_field :onboarded_at, nullable: true
  api_field :name
  api_field :slug
  # DEPRECATED (9/5/2014): use InvitationUrlsController#show instead
  api_field :invitation_url do
    ""
  end

  api_field :paid?, name: :paid, type: :boolean
  api_field :plan_name
  api_field :trial_ended?, name: :show_upgrade_banner, type: :boolean # deprecated, use trial_expired
  api_field :trial_ended?, name: :trial_expired, type: :boolean
  api_field :trial_active?, name: :trial_active, type: :boolean
  api_field :trial_days_remaining, nullable: true, type: :number

  api_field :viewer_can_post, type: :boolean do |org, options|
    next false unless options[:user]

    Pundit.policy!(options[:user], org).create_post?
  end

  api_field :viewer_can_create_digest, type: :boolean do |org, options|
    next false unless options[:user]

    Pundit.policy!(options[:user], org).create_digest?
  end

  api_field :viewer_can_create_project, type: :boolean do |org, options|
    next false unless options[:user]

    Pundit.policy!(options[:user], org).create_project?
  end

  api_field :viewer_can_see_new_project_button, type: :boolean do |org, options|
    next false unless options[:user]

    Pundit.policy!(options[:user], org).create_project? || !!options[:member]&.viewer?
  end

  api_field :viewer_can_see_projects_index, type: :boolean do |_org, options|
    !!options[:member]&.role_has_permission?(resource: Role::PROJECT_RESOURCE, permission: Role::VIEW_ANY_ACTION)
  end

  api_field :viewer_can_see_people_index, type: :boolean do |_org, options|
    next false unless options[:member]

    !options[:member].guest?
  end

  api_field :viewer_can_create_tag, type: :boolean do |org, options|
    next false unless options[:user]

    Pundit.policy!(options[:user], org).create_tag?
  end

  api_field :viewer_can_create_note, type: :boolean do |org, options|
    next false unless options[:user]

    Pundit.policy!(options[:user], org).create_note?
  end

  api_field :viewer_can_create_custom_reaction, type: :boolean do |org, options|
    next false unless options[:user]

    Pundit.policy!(options[:user], org).create_custom_reaction?
  end

  api_field :viewer_can_create_invitation, type: :boolean do |org, options|
    next false unless options[:user]

    Pundit.policy!(options[:user], org).invite_member?
  end

  api_field :viewer_can_manage_integrations, type: :boolean do |org, options|
    next false unless options[:user]

    Pundit.policy!(options[:user], org).manage_integrations?
  end

  api_field :viewer_is_admin, type: :boolean do |org, options|
    !!options[:member]&.admin? || org.admin?(options[:user])
  end

  api_field :viewer_member_id, nullable: true do |_org, options|
    options[:member]&.public_id
  end

  api_field :viewer_can_leave, type: :boolean do |org, options|
    (!options[:member].nil? && !options[:member]&.admin?) || !org.admin?(options[:user]) || org.admin_memberships.size > 1
  end

  api_association :settings, blueprint: OrganizationSettingsSerializer do |org|
    {
      enforce_two_factor_authentication: org.enforce_two_factor_authentication?,
    }
  end

  api_field :billing_email, view: :show, nullable: true
  api_field :email_domain, view: :show, nullable: true
  api_field :features, is_array: true, view: :show, enum: (Organization::FEATURE_FLAGS + Plan::FEATURES).uniq
  api_field :limits,
    type: :object,
    view: :show,
    properties: Plan::LIMITS.index_with { |_limit| { type: :number, nullable: true } }
  api_field :member_count, type: :number, view: :show
  api_field :channel_name
  api_field :presence_channel_name
end
