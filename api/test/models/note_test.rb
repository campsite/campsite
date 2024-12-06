# frozen_string_literal: true

require "test_helper"

class PostTest < ActiveSupport::TestCase
  context "#create" do
    test "subscribes author" do
      note = create(:note)
      assert_includes note.subscribers, note.user
    end
  end

  context "#search" do
    def setup
      Searchkick.enable_callbacks
      @member = create(:organization_membership)
      @user = @member.user
      @org = @member.organization
    end

    def teardown
      Searchkick.disable_callbacks
    end

    test "does not match other orgs" do
      create(:note, :reindex, title: "Foo bar", member: create(:organization_membership))
      results = Note.scoped_search(query: "foo", organization: @org)
      assert_equal 0, results.count
    end

    test "does not match discarded notes" do
      create(:note, :reindex, :discarded, title: "Foo bar", member: @member)
      results = Note.scoped_search(query: "foo", organization: @org)
      assert_equal 0, results.count
    end

    test "search title" do
      note =  create(:note, :reindex, title: "Foo bar", member: @member)
      results = Note.scoped_search(query: "foo", organization: @org)
      notes = Pundit.policy_scope(@user, Note.where(id: results.pluck(:id)))
      assert_equal 1, notes.count
      assert_equal note.id, notes.first.id
    end

    test "search description" do
      note =  create(:note, :reindex, title: "Foo bar", description_html: "<p>cat</p> <p>dog</p>", member: @member)
      results = Note.scoped_search(query: "dog", organization: @org)
      notes = Pundit.policy_scope(@user, Note.where(id: results.pluck(:id)))
      assert_equal 1, notes.count
      assert_equal note.id, notes.first.id
    end

    test "search comments" do
      note = create(:note, :reindex, title: "Foo bar", description_html: "<p>cat</p> <p>dog</p>", member: @member)
      create(:comment, body_html: "<p>needle</p>", subject: note, member: @member)
      note.reload.reindex(refresh: true)
      results = Note.scoped_search(query: "needle", organization: @org)
      notes = Pundit.policy_scope(@user, Note.where(id: results.pluck(:id)))
      assert_equal 1, notes.count
      assert_equal note.id, notes.first.id
    end

    test "works when there are no notes" do
      Note.destroy_all
      Note.reindex

      results = Note.scoped_search(query: "foo", organization: @org)

      assert_equal 0, results.count
    end
  end

  context "#update" do
    test "revalidates public note static cache on title change" do
      note = create(:note, visibility: :public, title: "Foo bar", description_html: "<p>cat</p> <p>dog</p>")
      note.update!(title: "Foo bar 2")
      assert_enqueued_sidekiq_job(RevalidatePublicNoteStaticCacheJob, args: [note.id])
    end

    test "revalidates public note static cache on description change" do
      note = create(:note, visibility: :public, title: "Foo bar", description_html: "<p>cat</p> <p>dog</p>")
      note.update!(description_html: "<p>cat</p> <p>dog 2</p>")
      assert_enqueued_sidekiq_job(RevalidatePublicNoteStaticCacheJob, args: [note.id])
    end

    test "revalidates public note static cache on discard" do
      note = create(:note, visibility: :public, title: "Foo bar", description_html: "<p>cat</p> <p>dog</p>")
      note.discard
      assert_enqueued_sidekiq_job(RevalidatePublicNoteStaticCacheJob, args: [note.id])
    end

    test "revalidates public note static cache on visibility change" do
      note = create(:note, visibility: :public, title: "Foo bar", description_html: "<p>cat</p> <p>dog</p>")
      note.update!(visibility: :default)
      assert_enqueued_sidekiq_job(RevalidatePublicNoteStaticCacheJob, args: [note.id])
    end

    test "does not revalidate for other changes" do
      note = create(:note, visibility: :public, title: "Foo bar", description_html: "<p>cat</p> <p>dog</p>")
      project = create(:project, organization: note.organization)
      note.add_to_project!(project: project)
      refute_enqueued_sidekiq_job(RevalidatePublicNoteStaticCacheJob, args: [note.id])
    end

    test "does not revalidate for non-public post" do
      note = create(:note, visibility: :default, title: "Foo bar", description_html: "<p>cat</p> <p>dog</p>")
      note.update!(title: "Foo bar 2")
      refute_enqueued_sidekiq_job(RevalidatePublicNoteStaticCacheJob, args: [note.id])
    end
  end

  context "#revalidate_public_static_cache_url" do
    test "path is correct" do
      org = create(:organization, slug: "foo")
      member = create(:organization_membership, organization: org)
      note = create(:note, member: member, visibility: :public, title: "Foo bar", description_html: "<p>cat</p> <p>dog</p>")
      path = note.revalidate_public_static_cache_path
      parsed = URI.parse(path)
      params = CGI.parse(parsed.query)

      assert_equal params["secret"].first, "REVALIDATE_SECRET"
      assert_equal params["rpath"].first, "/foo/p/notes/foo-bar-#{note.public_id}"
      assert_equal parsed.path, "/api/revalidate"
    end
  end

  context ".viewable_by" do
    test "member can view note in private project they belong to" do
      member = create(:organization_membership)

      project = create(:project, :private, organization: member.organization)
      project.project_memberships.create!(organization_membership: member)

      note = create(
        :note,
        member: create(:organization_membership, organization: member.organization),
        project: project,
      )

      ids = Note.viewable_by(member.user).pluck(:id)
      assert_equal 1, ids.count
      assert_includes ids, note.id
    end

    test "member can view note in open project they don't belong to" do
      member = create(:organization_membership)

      project = create(:project, organization: member.organization)

      note = create(
        :note,
        member: create(:organization_membership, organization: member.organization),
        project: project,
      )

      ids = Note.viewable_by(member.user).pluck(:id)
      assert_equal 1, ids.count
      assert_includes ids, note.id
    end

    test "guest can view note in open project they belong to" do
      guest_member = create(:organization_membership, :guest)
      project = create(:project, organization: guest_member.organization)
      project.add_member!(guest_member)
      note = create(:note, project: project)

      assert_equal [note], Note.viewable_by(guest_member.user)
    end

    test "guest can't view note in open project they don't belong to" do
      guest_member = create(:organization_membership, :guest)
      project = create(:project, organization: guest_member.organization)
      create(:note, project: project)

      assert_predicate Note.viewable_by(guest_member.user), :none?
    end
  end

  context "#export_json" do
    test "exports correctly" do
      note = create(:note, title: "Foo bar", description_html: "<p><b>Hello</b> world</p>")
      create_list(:comment, 2, subject: note)
      export = note.export_json
      assert_equal 2, export[:comments].count
      assert_equal "Foo bar", export[:title]
      assert_equal "**Hello** world", export[:description]
    end
  end
end
