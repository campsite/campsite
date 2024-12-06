# frozen_string_literal: true

module DemoOrgs
  class Generator
    ORG_NAME = "Frontier Forest"
    ORG_SLUG = "frontier-forest"
    ORG_AVATAR = "o/dev-seed-files/forest_org_icon.png"

    # TODO: randomly generate this for fake users
    DEFAULT_PASSWORD = "CampsiteDesign!"

    def initialize(admin: nil, org: nil)
      @admin = admin || create_admin
      @org = org || create_org

      # we run this here because users rarely change, but it could be moved to update_content if needed
      create_users if @org.memberships.find_by(role_name: :member).nil?
    end

    def update_content
      delete_calls
      delete_notes
      delete_threads
      delete_posts
      delete_projects

      create_projects
      create_posts
      create_threads
      create_notes
      create_calls
    end

    def organization
      @org
    end

    def admin_membership
      @admin.organization_memberships.find_by(organization: @org)
    end

    def users_data
      data("users")
    end

    def projects_data
      data("projects")
    end

    def posts_data
      data("posts")
    end

    def threads_data
      data("threads")
    end

    def notes_data
      data("notes")
    end

    def calls_data
      data("calls")
    end

    private

    def employee_email(name)
      name.downcase.gsub(" ", ".") + "@demo.campsite.com"
    end

    def employee_username(name)
      name.downcase.gsub(" ", "_")
    end

    def data(name)
      JSON.parse(File.read(File.join(__dir__, "data/#{name}.json")))
    end

    def locate_user(org, name)
      # map all admin content to the org owner
      return admin_membership.user if name == User.dev_user.name

      org.members.find_by(name: name)
    end

    def locate_member(org, name)
      org.memberships.find_by(user: locate_user(org, name))
    rescue
      Rails.logger.debug { "Could not find user: #{name}" }
    end

    def locate_project(org, name)
      org.projects.find_by(name: name)
    end

    def locate_oauth_application(data)
      data["oauth_provider"] ? OauthApplication.find_by(name: data["oauth_provider"]) : nil
    end

    def create_user(name:, avatar_path: nil, **_rest)
      created_at = Time.current - rand(9.months.to_i)

      User.find_or_create_by(email: employee_email(name)) do |u|
        u.name = name
        u.username = employee_username(name)
        u.password = DEFAULT_PASSWORD
        u.password_confirmation = DEFAULT_PASSWORD
        u.avatar_path = avatar_path
        u.created_at = created_at
        u.confirmed_at = created_at
        u.demo = true
        u.staff = true
      end
    end

    def create_post(org:, member:, title:, description_html:, project: nil, unfurled_link: nil, oauth_application: nil)
      org.posts.create!(
        title: title,
        description_html: description_html,
        member: member,
        oauth_application: oauth_application,
        project: project || org.general_project,
        unfurled_link: unfurled_link,
      )
    end

    def create_comment(obj:, member:, parent: nil, data: {}, oauth_application: nil)
      comment = obj.comments.create!(
        public_id: data["public_id"],
        member: member,
        body_html: data["body_html"],
        parent: parent,
        oauth_application: oauth_application,
      )

      data["attachments"]&.each do |a|
        comment.attachments.create!(**a.symbolize_keys)
      end

      data["reactions"]&.each do |r|
        comment.reactions.create!(
          member: locate_member(@org, r["user"]),
          content: r["content"],
        )
      end

      comment
    end

    def create_thread(org:, owner:, member_ids:, title: nil, image_path: nil, messages: [])
      organization_memberships = org
        .kept_memberships
        .where(public_id: member_ids)
        .includes(:user)
        .references(:user)
      thread = MessageThread.create!(
        title: title,
        image_path: image_path,
        owner: owner,
        event_actor: owner,
        organization_memberships: organization_memberships + [owner],
        group: organization_memberships.size > 1,
      )
      messages.each do |m|
        message = thread.send_message!(
          sender: locate_member(org, m["user"]),
          oauth_application: locate_oauth_application(m),
          content: m["content"],
        )

        m["reactions"]&.each do |reaction|
          message.reactions.create!(
            member: locate_member(org, reaction["user"]),
            content: reaction["content"],
          )
        end
      end

      thread
    end

    def create_admin
      Rails.logger.debug("-- Creating org admin --")

      admin_user = users_data.select { |u| u["internal_description"] == "owner" }.first

      create_user(**admin_user.symbolize_keys)
    end

    def create_org
      Rails.logger.debug("-- Creating organization --")

      Organization.create_organization(creator: @admin, name: ORG_NAME, slug: ORG_SLUG, avatar_path: ORG_AVATAR, demo: true)
    end

    def create_users
      Rails.logger.debug("-- Creating users --")

      users_data.each do |user|
        description = user["internal_description"]

        next if description == "owner"

        u = create_user(**user.symbolize_keys)

        if description == "invitee"
          @org.invitations.create!(sender: @admin, recipient: u, email: u.email, role: :member)
        elsif description == "membership_request"
          @org.membership_requests.create!(user: u)
        else
          @org.create_membership!(user: u, role_name: :member)
        end
      end
    end

    def create_posts
      Rails.logger.debug("-- Creating posts --")

      posts_data.reverse.each do |p|
        post = create_post(
          org: @org,
          title: p["title"],
          description_html: p["description_html"],
          member: p["author"] ? locate_member(@org, p["author"]) : nil,
          oauth_application: locate_oauth_application(p),
          project: locate_project(@org, p["project"]),
          unfurled_link: p["unfurled_link"],
        )

        p["reactions"]&.each do |r|
          post.reactions.create!(
            content: r["content"],
            member: locate_member(@org, r["user"]),
          )
        end

        p["attachments"]&.each do |a|
          post.attachments.create!(**a.symbolize_keys)
        end

        p["comments"]&.each do |c|
          comment = create_comment(
            data: c,
            obj: post,
            member: locate_member(@org, c["user"]),
            oauth_application: locate_oauth_application(c),
          )

          c["replies"]&.each do |r|
            create_comment(
              data: r,
              obj: post,
              parent: comment,
              member: locate_member(@org, r["user"]),
            )
          end
        end

        next unless p["poll"]

        poll = post.create_poll!(description: "")

        p["poll"]["options"]&.each do |v|
          option = poll.options.create!(description: v["description"])

          v["votes"].each do |name|
            option.votes.create!(member: locate_member(@org, name))
          end
        end
      end
    end

    def delete_posts
      @org.posts.destroy_all
    end

    def create_projects
      Rails.logger.debug("-- Creating projects --")

      projects_data.reverse.each do |p|
        project = @org.projects.create!(
          name: p["name"],
          description: p["description"],
          private: p["private"] || false,
          accessory: p["accessory"] || nil,
          creator: admin_membership,
          archived_at: p["archived"] ? Time.current : nil,
          is_default: p["is_default"] || false,
        )

        if p["is_default"]
          @org.memberships.each do |membership|
            project.add_member!(membership, skip_notifications: true)
          end
        else
          p["members"].each do |name|
            membership = locate_member(@org, name)
            next unless membership

            project.add_member!(membership, skip_notifications: true)
          end
        end

        p["favorites"]&.each do |name|
          membership = locate_member(@org, name)
          next unless membership

          project.favorites.create!(organization_membership: membership)
        end
      end
    end

    def delete_projects
      @org.projects.where.not(is_default: true).destroy_all
    end

    def create_threads
      Rails.logger.debug("-- Creating threads --")

      threads_data.reverse.each do |t|
        owner = locate_member(@org, t["owner"])
        members = t["members"].map { |name| locate_member(@org, name) }.compact

        thread = create_thread(
          org: @org,
          owner: owner,
          messages: t["messages"],
          member_ids: members.map(&:public_id),
          title: t["title"],
          image_path: t["image_path"],
        )

        t["favorites"]&.each do |name|
          membership = locate_member(@org, name)
          next unless membership

          thread.favorites.create!(organization_membership: membership)
        end
      end
    end

    def delete_threads
      @org.memberships.each { |m| m.message_threads.destroy_all }
    end

    def create_notes
      Rails.logger.debug("-- Creating notes --")

      notes_data.reverse.each do |n|
        member = locate_member(@org, n["member"])

        note = member.notes.create!(
          title: n["title"],
          description_html: n["description_html"],
          visibility: n["public_visibility"] ? 1 : 0,
          project: locate_project(@org, n["project"]),
          project_permission: n["project_permission"],
          description_schema_version: n["description_schema_version"],
        )

        n["comments"]&.each do |c|
          comment = create_comment(
            data: c,
            obj: note,
            member: locate_member(@org, c["user"]),
          )

          c["replies"]&.each do |r|
            create_comment(
              data: r,
              obj: note,
              parent: comment,
              member: locate_member(@org, r["user"]),
            )
          end
        end
      end
    end

    def delete_notes
      @org.notes.each do |n|
        n.comments.destroy_all
        n.destroy
      end
    end

    def create_calls
      Rails.logger.debug("-- Creating calls --")

      calls_data.reverse.each do |c|
        members = c["peers"].map { |name| locate_member(@org, name) }.compact
        creator = members.first

        room = @org.call_rooms.create!(creator: creator, source: :new_call_button)

        started_at = Time.current - rand(1.day.to_i)
        stopped_at = started_at + c["recordings"].pluck("duration").max.seconds

        call = room.calls.create!(
          started_at: started_at,
          stopped_at: stopped_at,
          remote_session_id: SecureRandom.uuid,
          generated_title: c["generated_title"],
          generated_title_status: :completed,
          generated_summary_status: :completed,
        )

        peers = members.map do |m|
          call.peers.create!(
            organization_membership: m,
            joined_at: started_at,
            left_at: stopped_at,
            remote_peer_id: SecureRandom.uuid,
            name: m.user.display_name,
          )
        end

        c["recordings"].map do |r|
          recording = call.recordings.create!(
            started_at: started_at,
            stopped_at: stopped_at,
            transcription_started_at: stopped_at,
            remote_beam_id: SecureRandom.uuid,
            remote_job_id: SecureRandom.uuid,
            file_path: r["file_path"],
            size: r["size"],
            duration: r["duration"],
            max_width: r["max_width"],
            max_height: r["max_height"],
            transcription_vtt: r["transcription_vtt"],
            transcription_succeeded_at: stopped_at + 5.minutes,
          )

          peers.each { |p| recording.speakers.create!(name: p.name, call_peer: p) }

          r["summary_sections"].each do |s|
            section = recording.summary_sections.create!(
              status: :success,
              section: s["section"].to_sym,
              response: s["response"],
            )
            section.update(prompt: section.system_prompt)
          end
        end

        call.update_recordings_duration!
        call.update_summary_from_recordings!
      end
    end

    def delete_calls
      @org.call_rooms.destroy_all
    end
  end
end
