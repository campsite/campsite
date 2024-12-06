# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class NotesControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @organization = create(:organization)
        @member = create(:organization_membership, organization: @organization)
      end

      context "#index" do
        context "#contents" do
          before do
            @note = create(:note, member: @member)
            @other_note = create(:note, member: @member)
            create(:note, member: @member)
          end

          test("it includes preview commenters") do
            other_member, other_other_member = create_list(:organization_membership, 2, organization: @organization)

            create_list(:comment, 2, subject: @note, member: @member)
            create_list(:comment, 2, subject: @note, member: other_member)

            create_list(:comment, 3, subject: @other_note)
            create(:comment, subject: @other_note, member: @member)
            create(:comment, subject: @other_note, member: other_member)
            create(:comment, subject: @other_note, member: other_other_member)

            sign_in @member.user

            get organization_notes_path(@organization.slug), params: { filter: "mine" }

            assert_response :ok
            assert_response_gen_schema
            note_response = json_response["data"].find { |n| n["id"] == @note.public_id }
            assert_equal 2, note_response["latest_commenters"].length
            assert_equal [other_member, @member].pluck(:public_id), note_response["latest_commenters"].pluck("id")

            other_note_response = json_response["data"].find { |n| n["id"] == @other_note.public_id }
            assert_equal 3, other_note_response["latest_commenters"].length
            assert_equal [other_other_member, other_member, @member].pluck(:public_id), other_note_response["latest_commenters"].pluck("id")
          end

          test("notes ordered by last_activity_at update properly") do
            sign_in @member.user

            create(:note, member: @member, last_activity_at: 1.minute.ago)            # NOTE: 1
            note_2 = create(:note, member: @member, last_activity_at: 2.minutes.ago)  # NOTE: 2
            create(:note, member: @member, last_activity_at: 3.minutes.ago)           # NOTE: 3
            note_4 = create(:note, member: @member, last_activity_at: 4.minutes.ago)  # NOTE: 4
            create(:note, member: @member, last_activity_at: 5.minutes.ago)           # NOTE: 5

            Timecop.freeze do
              note_2.update!(last_activity_at: Time.current)
              note_4.update!(last_activity_at: 1.month.ago)

              get organization_notes_path(@organization.slug), params: { order: { by: "last_activity_at", direction: "desc" } }
              assert_response :ok
              assert_response_gen_schema
              assert_equal note_2.public_id, json_response["data"].first["id"]
              assert_equal note_4.public_id, json_response["data"].last["id"]
            end
          end
        end

        context "#filters" do
          setup do
            @notes_mine = create_list(:note, 2, member: @member)

            other_member = create(:organization_membership, organization: @organization)

            @notes_shared = create_list(:note, 2, member: other_member)
            create(:permission, :view, user: @member.user, subject: @notes_shared[0])
            create(:permission, :edit, user: @member.user, subject: @notes_shared[1])

            @notes_projects = []

            @open_project = create(:project, organization: @organization)
            create(:project_membership, project: @open_project, organization_membership: @member)
            @open_project_note = create(:note, member: @member, project: @open_project)
            @notes_mine << @open_project_note
            @notes_projects << @open_project_note

            @private_project = create(:project, :private, organization: @organization)
            create(:project_membership, project: @private_project, organization_membership: @member)
            @private_project_note = create(:note, member: @member, project: @private_project)
            @notes_mine << @private_project_note
            @notes_projects << @private_project_note

            @archived_project = create(:project, :archived, organization: @organization)
            create(:project_membership, project: @archived_project, organization_membership: @member)
            @archived_project_note = create(:note, member: @member, project: @archived_project)
            @notes_mine << @archived_project_note

            @open_project_without_project_membership = create(:project, organization: @organization)
            @notes_mine << create(:note, member: @member, project: @open_project_without_project_membership)

            @other_open_project = create(:project, organization: @organization)
            @other_open_project_note = create(:note, member: other_member, project: @other_open_project)
            @other_private_project = create(:project, :private, organization: @organization)
            @other_private_project_note = create(:note, member: other_member, project: @other_private_project)

            @notes_org = [
              @other_open_project_note,
              @open_project_note,
            ]

            @note_other_private = create(:note, member: other_member)
          end

          test("created") do
            sign_in @member.user

            get organization_notes_path(@organization.slug), params: { filter: "created" }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 6, json_response["data"].length

            json_ids = json_response["data"].pluck("id")
            assert_equal @notes_mine.map(&:public_id).sort, json_ids.sort
            assert_not_includes json_ids, @note_other_private.public_id
            assert_not_includes json_ids, @notes_org[0].public_id
            assert_not_includes json_ids, @notes_shared[0].public_id
          end

          test("projects") do
            sign_in @member.user

            get organization_notes_path(@organization.slug), params: { filter: "projects" }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length

            json_ids = json_response["data"].pluck("id")
            assert_equal @notes_projects.map(&:public_id).sort, json_ids.sort
          end

          test("unfiltered") do
            sign_in @member.user

            get organization_notes_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 9, json_response["data"].length

            json_ids = json_response["data"].pluck("id")
            ids = (@notes_mine + @notes_shared + @notes_org).map(&:public_id).uniq
            assert_equal ids.sort, json_ids.sort
          end
        end

        context "#projects" do
          test "considers project permissions" do
            private_project = create(:project, :private, organization: @organization)
            private_project.project_memberships.create!(organization_membership: @member)

            private_project_note = create(
              :note,
              member: create(:organization_membership, organization: @organization),
              project: private_project,
            )
            open_project_note = create(
              :note,
              member: create(:organization_membership, organization: @organization),
              project: create(:project, organization: @organization),
            )
            other_private_project_note = create(
              :note,
              member: create(:organization_membership, organization: @organization),
              project: create(:project, :private, organization: @organization),
            )

            sign_in @member.user

            get organization_notes_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 2, json_response["data"].length

            ids = json_response["data"].pluck("id")
            assert_includes ids, private_project_note.public_id
            assert_includes ids, open_project_note.public_id
            assert_not_includes ids, other_private_project_note.public_id
          end
        end

        context "#permissions" do
          before do
            @note = create(:note, member: @member)
            @other_note = create(:note, member: @member)
            create(:note, member: @member)
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            get organization_notes_path(@organization.slug), params: { filter: "mine" }
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_notes_path(@organization.slug), params: { filter: "mine" }
            assert_response :unauthorized
          end

          test "query count" do
            sign_in @member.user
            assert_query_count 9 do
              get organization_notes_path(@organization.slug), params: { filter: "mine" }
            end

            assert_response :ok
          end
        end

        test "search returns results" do
          mine_1 = create(:note, member: @member, title: "Needle in a haystack")

          other_member = create(:organization_membership, organization: @organization)

          shared_1 = create(:note, member: other_member, title: "Needle in a haystack")
          shared_2 = create(:note, member: other_member)
          create(:permission, :view, user: @member.user, subject: shared_1)
          create(:permission, :edit, user: @member.user, subject: shared_2)

          open_project = create(:project, organization: @organization)
          create(:project_membership, project: open_project, organization_membership: @member)
          open_project_note = create(:note, member: other_member, project: open_project, title: "Needle in a haystack")

          other_open_project = create(:project, organization: @organization)
          other_open_project_note = create(:note, member: other_member, project: other_open_project)

          note_other_private = create(:note, member: other_member, title: "Needle")

          Note.reindex

          sign_in @member.user

          get organization_notes_path(@organization.slug), params: { q: "needle" }

          assert_response :ok
          assert_response_gen_schema
          assert_equal 3, json_response["data"].length

          json_ids = json_response["data"].pluck("id")
          assert_includes json_ids, mine_1.public_id
          assert_includes json_ids, shared_1.public_id
          assert_not_includes json_ids, shared_2.public_id
          assert_includes json_ids, open_project_note.public_id
          assert_not_includes json_ids, other_open_project_note.public_id
          assert_not_includes json_ids, note_other_private.public_id
        end
      end

      context "#create" do
        test "create a note with title and description for an org admin" do
          sign_in create(:organization_membership, :admin, organization: @organization).user

          assert_difference -> { Note.count } do
            post organization_notes_path(@organization.slug),
              params: {
                title: "My new note",
                description_html: "<p>checkout my new work</p>",
              },
              as: :json
          end

          assert_response_gen_schema
          assert_equal "My new note", json_response["title"]
          assert_equal "<p>checkout my new work</p>", json_response["description_html"]
          assert_equal "none", json_response["project_permission"]
        end

        test "create a note with title and description for an org member" do
          sign_in create(:organization_membership, :member, organization: @organization).user

          assert_difference -> { Note.count } do
            post organization_notes_path(@organization.slug),
              params: {
                title: "My new note",
                description_html: "<p>checkout my new work</p>",
              },
              as: :json
          end

          assert_response :created
          assert_response_gen_schema

          assert_equal "My new note", json_response["title"]
          assert_equal "<p>checkout my new work</p>", json_response["description_html"]
          assert_equal "none", json_response["project_permission"]

          note = Note.find_by(public_id: json_response["id"])
          assert_equal "My new note", note.title
          assert_equal "<p>checkout my new work</p>", note.description_html
          assert_equal "none", note.project_permission
        end

        test "query count" do
          sign_in @member.user

          assert_query_count 22 do
            post organization_notes_path(@organization.slug),
              params: {
                title: "My new note",
                description_html: "<p>checkout my new work</p>",
              },
              as: :json
          end
        end

        test "create a note with a project" do
          project = create(:project, organization: @organization)

          sign_in create(:organization_membership, :admin, organization: @organization).user

          assert_difference -> { Note.count } do
            post organization_notes_path(@organization.slug),
              params: {
                title: "My new note",
                description_html: "<p>checkout my new work</p>",
                project_id: project.public_id,
              },
              as: :json
          end

          assert_response :created
          assert_response_gen_schema

          assert_equal "My new note", json_response["title"]
          assert_equal "<p>checkout my new work</p>", json_response["description_html"]
          assert_equal project.public_id, json_response.dig("project", "id")
          assert_equal "view", json_response["project_permission"]

          note = Note.find_by(public_id: json_response["id"])
          assert_equal "My new note", note.title
          assert_equal "<p>checkout my new work</p>", note.description_html
          assert_equal project, note.project
          assert_equal "view", note.project_permission
        end

        test "returns 404 for invalid project id" do
          sign_in create(:organization_membership, :admin, organization: @organization).user

          assert_no_difference -> { Note.count } do
            post organization_notes_path(@organization.slug),
              params: {
                title: "My new note",
                description_html: "<p>checkout my new work</p>",
                project_id: "0x123",
              },
              as: :json
          end

          assert_response :not_found
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          post organization_notes_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          post organization_notes_path(@organization.slug)
          assert_response :unauthorized
        end
      end

      context "#show" do
        setup do
          @author_member = create(:organization_membership, organization: @organization)
          @note = create(:note, member: @author_member)
        end

        test "works for the note creator" do
          sign_in @author_member.user
          get organization_note_path(@organization.slug, @note.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal @note.public_id, json_response["id"]
        end

        test "includes the project" do
          project = create(:project, organization: @organization)
          @note.update!(project: project)

          sign_in @author_member.user
          get organization_note_path(@organization.slug, @note.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal @note.public_id, json_response["id"]
          assert_equal project.public_id, json_response.dig("project", "id")
        end

        test "includes unshown follow ups" do
          unshown_follow_up = create(:follow_up, subject: @note)
          create(:follow_up, :shown, subject: @note)

          sign_in @author_member.user
          get organization_note_path(@organization.slug, @note.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal [unshown_follow_up.public_id], json_response["follow_ups"].pluck("id")
        end

        test "works for open projects" do
          project = create(:project, organization: @organization)
          @note.add_to_project!(project: project)

          sign_in create(:organization_membership, :member, organization: @organization).user
          get organization_note_path(@organization.slug, @note.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_not json_response["viewer_is_author"]
          assert json_response["viewer_can_comment"]
          assert_not json_response["viewer_can_edit"]
        end

        test "works for private projects where the viewer is a member" do
          other_member = create(:organization_membership, :member, organization: @organization)
          project = create(:project, :private, organization: @organization)
          project.project_memberships.create!(organization_membership: other_member)
          @note.add_to_project!(project: project)

          sign_in other_member.user
          get organization_note_path(@organization.slug, @note.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_not json_response["viewer_is_author"]
          assert json_response["viewer_can_comment"]
          assert_not json_response["viewer_can_edit"]
        end

        test "does not work for member not part of private project" do
          other_member = create(:organization_membership, :member, organization: @organization)
          project = create(:project, :private, organization: @organization)
          @note.update!(project: project)

          sign_in other_member.user
          get organization_note_path(@organization.slug, @note.public_id)

          assert_response :forbidden
        end

        test "works for viewer permission" do
          other_member = create(:organization_membership, :member, organization: @organization)
          create(:permission, user: other_member.user, subject: @note, action: :view)

          sign_in other_member.user
          get organization_note_path(@organization.slug, @note.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal @note.public_id, json_response["id"]
          assert_not json_response["viewer_is_author"]
          assert json_response["viewer_can_comment"]
          assert_not json_response["viewer_can_edit"]
        end

        test "considers only the viewers permission" do
          viewer_member = create(:organization_membership, :member, organization: @organization)
          create(:permission, user: viewer_member.user, subject: @note, action: :view)

          sign_in create(:organization_membership, :member, organization: @organization).user
          get organization_note_path(@organization.slug, @note.public_id)

          assert_response :forbidden
        end

        test "works for editor permission" do
          other_member = create(:organization_membership, :member, organization: @organization)
          create(:permission, user: other_member.user, subject: @note, action: :edit)

          sign_in other_member.user
          get organization_note_path(@organization.slug, @note.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal @note.public_id, json_response["id"]
          assert_not json_response["viewer_is_author"]
          assert json_response["viewer_can_comment"]
          assert json_response["viewer_can_edit"]
        end

        test "includes viewer_has_favorited true when viewer has favorited" do
          @note.favorites.create!(organization_membership: @author_member)

          sign_in @author_member.user
          get organization_note_path(@organization.slug, @note.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal true, json_response["viewer_has_favorited"]
        end

        test "includes viewer_has_favorited false when viewer has not favorited" do
          sign_in @author_member.user
          get organization_note_path(@organization.slug, @note.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal false, json_response["viewer_has_favorited"]
        end

        test "includes resource mentions" do
          mentioned_post = create(:post, organization: @organization)

          mentioned_note = create(:note, member: create(:organization_membership, organization: @organization))
          open_project = create(:project, organization: @organization)
          mentioned_note.add_to_project!(project: open_project)

          mentioned_call = create(:call, room: create(:call_room, organization: @organization))
          create(:call_peer, call: mentioned_call, organization_membership: @author_member)

          html = <<~HTML.strip
            <resource-mention href="https://app.campsite.com/campsite/posts/#{mentioned_post.public_id}"></resource-mention>
            <resource-mention href="https://app.campsite.com/campsite/notes/#{mentioned_note.public_id}"></resource-mention>
            <resource-mention href="https://app.campsite.com/campsite/calls/#{mentioned_call.public_id}"></resource-mention>
          HTML

          @note.update!(description_html: html)

          sign_in @author_member.user
          get organization_note_path(@organization.slug, @note.public_id)

          assert_response :ok
          assert_response_gen_schema

          assert_equal [mentioned_post.public_id], json_response["resource_mentions"].map { |mention| mention.dig("post", "id") }.compact
          assert_equal [mentioned_note.public_id], json_response["resource_mentions"].map { |mention| mention.dig("note", "id") }.compact
          assert_equal [mentioned_call.public_id], json_response["resource_mentions"].map { |mention| mention.dig("call", "id") }.compact
        end

        test "does not work for an org admin" do
          sign_in create(:organization_membership, :admin, organization: @organization).user
          get organization_note_path(@organization.slug, @note.public_id)
          assert_response :forbidden
        end

        test "does not work for other org members" do
          sign_in create(:organization_membership, :member, organization: @organization).user
          get organization_note_path(@organization.slug, @note.public_id)
          assert_response :forbidden
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          get organization_note_path(@organization.slug, @note.public_id)
          assert_response :forbidden
        end

        test "return 403 for an unauthenticated user" do
          get organization_note_path(@organization.slug, @note.public_id)
          assert_response :unauthorized
        end

        test "query count" do
          sign_in @author_member.user
          assert_query_count 10 do
            get organization_note_path(@organization.slug, @note.public_id)
          end

          assert_response :ok
        end
      end

      context "#update" do
        setup do
          @author_member = create(:organization_membership, organization: @organization)
          @note = create(:note, member: @author_member)
        end

        test "works for note author" do
          sign_in @author_member.user
          put organization_note_path(@organization.slug, @note.public_id),
            params: { title: "foo bar baz" },
            as: :json

          assert_response :ok
          assert_response_gen_schema
          assert_equal "foo bar baz", json_response["title"]
          assert_enqueued_sidekiq_job(PusherTriggerJob, args: [
            @note.channel_name,
            "content-stale",
            {
              user_id: @author_member.user.public_id,
              attributes: { title: "foo bar baz" },
            }.to_json,
          ])
        end

        test "does not work for viewer permission" do
          other_member = create(:organization_membership, :member, organization: @organization)
          create(:permission, user: other_member.user, subject: @note, action: :view)

          sign_in other_member.user
          put organization_note_path(@organization.slug, @note.public_id),
            params: { title: "foo bar baz" },
            as: :json

          assert_response :forbidden
        end

        test "works for editor permission" do
          other_member = create(:organization_membership, :member, organization: @organization)
          create(:permission, user: other_member.user, subject: @note, action: :edit)

          sign_in other_member.user
          put organization_note_path(@organization.slug, @note.public_id),
            params: { title: "foo bar baz" },
            as: :json

          assert_response :ok
          assert_response_gen_schema
        end

        test "does not work for project viewer" do
          project = create(:project, organization: @organization)
          viewer_member = create(:organization_membership, :member, organization: @organization)
          create(:project_membership, project: project, organization_membership: viewer_member)

          @note.update!(project: project, project_permission: :view)

          sign_in viewer_member.user
          put organization_note_path(@organization.slug, @note.public_id),
            params: { title: "foo bar baz" },
            as: :json

          assert_response :forbidden
        end

        test "works for project editor" do
          project = create(:project, organization: @organization)
          editor_member = create(:organization_membership, :member, organization: @organization)

          @note.update!(project: project, project_permission: :edit)

          sign_in editor_member.user
          put organization_note_path(@organization.slug, @note.public_id),
            params: { title: "foo bar baz" },
            as: :json

          assert_response :ok
          assert_response_gen_schema
        end

        test "does not work for member not part of private project" do
          private_project = create(:project, :private, organization: @organization)
          @note.update!(project: private_project, project_permission: :edit)

          sign_in create(:organization_membership, :member, organization: @organization).user
          put organization_note_path(@organization.slug, @note.public_id),
            params: { title: "foo bar baz" },
            as: :json

          assert_response :forbidden
        end

        test "does not work for an org admin" do
          other_member = create(:organization_membership, :admin, organization: @organization)

          sign_in other_member.user
          put organization_note_path(@organization.slug, @note.public_id),
            params: { description_html: "<p>update note description</p>" },
            as: :json

          assert_response :forbidden
        end

        test "does not work for other org members" do
          other_member = create(:organization_membership, :member, organization: @organization)

          sign_in other_member.user
          put organization_note_path(@organization.slug, @note.public_id),
            params: { description_html: "<p>update note description</p>" },
            as: :json

          assert_response :forbidden
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          put organization_note_path(@organization.slug, @note.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          put organization_note_path(@organization.slug, @note.public_id)
          assert_response :unauthorized
        end
      end

      context "#destroy" do
        setup do
          @author_member = create(:organization_membership, organization: @organization)
          @note = create(:note, member: @author_member)
        end

        test "works for note creator" do
          sign_in @author_member.user
          delete organization_note_path(@organization.slug, @note.public_id)

          assert_response :no_content
          assert_nil Note.kept.find_by(id: @note.id)
          assert_equal @author_member, @note.events.destroyed_action.first.actor
        end

        test "does not work for viewer permission" do
          other_member = create(:organization_membership, :member, organization: @organization)
          create(:permission, user: other_member.user, subject: @note, action: :view)

          sign_in other_member.user
          delete organization_note_path(@organization.slug, @note.public_id)

          assert_response :forbidden
        end

        test "does not work for editor permission" do
          other_member = create(:organization_membership, :member, organization: @organization)
          create(:permission, user: other_member.user, subject: @note, action: :edit)

          sign_in other_member.user
          delete organization_note_path(@organization.slug, @note.public_id)

          assert_response :forbidden
        end

        test "does not work for project viewer" do
          project = create(:project, organization: @organization)
          viewer_member = create(:organization_membership, :member, organization: @organization)
          create(:project_membership, project: project, organization_membership: viewer_member)

          @note.update!(project: project, project_permission: :view)

          sign_in viewer_member.user
          delete organization_note_path(@organization.slug, @note.public_id)

          assert_response :forbidden
        end

        test "does not work for project editor" do
          project = create(:project, organization: @organization)
          editor_member = create(:organization_membership, :member, organization: @organization)
          create(:project_membership, project: project, organization_membership: editor_member)

          @note.update!(project: project, project_permission: :edit)

          sign_in editor_member.user
          delete organization_note_path(@organization.slug, @note.public_id)

          assert_response :forbidden
        end

        test "does not work for member not part of private project" do
          private_project = create(:project, :private, organization: @organization)
          @note.update!(project: private_project, project_permission: :edit)

          sign_in create(:organization_membership, :member, organization: @organization).user
          delete organization_note_path(@organization.slug, @note.public_id)

          assert_response :forbidden
        end

        test "does not work for an org admin" do
          admin = create(:organization_membership, :admin, organization: @organization)

          sign_in admin.user
          delete organization_note_path(@organization.slug, @note.public_id)

          assert_response :no_content
          assert_nil Note.kept.find_by(id: @note.id)
          assert_equal admin, @note.events.destroyed_action.first.actor
        end

        test "does not work for an org member" do
          sign_in create(:organization_membership, :member, organization: @organization).user
          delete organization_note_path(@organization.slug, @note.public_id)

          assert_response :forbidden
        end

        test "discards all comments, replies, and reactions" do
          comment = create(:comment, subject: @note)
          comment_on_other_note = create(:comment)
          reply = create(:comment, subject: @note, parent: comment)
          reaction = create(:reaction, subject: @note)
          reaction_on_reply = create(:reaction, subject: reply)
          reaction_on_other_note = create(:reaction)

          sign_in @author_member.user
          delete organization_note_path(@organization.slug, @note.public_id)

          assert_response :no_content
          assert_predicate comment.reload, :discarded?
          assert comment.events.destroyed_action.first
          assert_predicate reply.reload, :discarded?
          assert_predicate reaction.reload, :discarded?
          assert_predicate reaction_on_reply.reload, :discarded?
          assert_not_predicate comment_on_other_note.reload, :discarded?
          assert_not_predicate reaction_on_other_note.reload, :discarded?
        end

        test "returns 403 for a random user" do
          sign_in create(:user)
          delete organization_note_path(@organization.slug, @note.public_id)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          delete organization_note_path(@organization.slug, @note.public_id)
          assert_response :unauthorized
        end
      end
    end
  end
end
