# frozen_string_literal: true

class Organization
  class CreateOrganization
    def initialize(creator:, name:, slug:, avatar_path: nil, demo: false, role: nil, org_size: nil, source: nil, why: nil)
      @creator = creator
      @name = name
      @slug = slug
      @avatar_path = avatar_path
      @demo = demo
      @role = role
      @org_size = org_size
      @source = source
      @why = why
    end

    def run
      org = Organization.new(
        billing_email: @creator.email,
        creator: @creator,
        name: @name,
        slug: @slug,
        avatar_path: @avatar_path,
        creator_role: @role,
        creator_org_size: @org_size,
        creator_source: @source,
        creator_why: @why,
        trial_ends_at: Organization::TRIAL_DURATION.from_now,
      )

      if @demo
        org.demo = true
        org.onboarded_at = Time.current
        org.plan_name = Plan::PRO_NAME
      end

      org.save!

      # we don't use organization.create_membership! here because that method expects the org to be set up
      # (default projects, campsite intengration, etc) but we've not done that yet.
      admin = org.memberships.create!(user: @creator, role_name: Role::ADMIN_NAME)

      org.tags.insert_all!(Tag::ORG_DEFAULT_TAGS.map { |tag_name| { name: tag_name, public_id: Tag.generate_public_id } })

      org.projects.insert_all!(Project::ORG_DEFAULT_PROJECTS.map do |default_project|
        {
          name: default_project[:name],
          last_activity_at: Time.current,
          description: default_project[:description],
          cover_photo_path: default_project[:cover_photo_path],
          is_general: default_project[:is_general],
          is_default: true,
          creator_id: admin.id,
          public_id: Project.generate_public_id,
          invite_token: Project.new.generate_unique_token(attr_name: :invite_token),
        }
      end)

      org.projects.each do |project|
        project.add_member!(admin, skip_notifications: true)
      end

      org.create_campsite_integration

      org
    end
  end
end
