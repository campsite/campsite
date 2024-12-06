# frozen_string_literal: true

require "test_helper"

class Post
  class CreatePostTest < ActiveSupport::TestCase
    setup do
      @org = create(:organization)
      @project = create(:project, organization: @org)
      @user = create(:user)
      @member = create(:organization_membership, organization: @org, user: @user)
    end

    test "creates a post with a description" do
      Timecop.freeze(Time.current) do
        post = Post::CreatePost.new(member: @member, organization: @org, project: @project, params: { description_html: "<p>this is a description</p>" }).run

        assert_empty post.errors
        assert_predicate post, :persisted?
        assert_equal "<p>this is a description</p>", post.description_html
        assert_equal @project, post.project
        assert_equal @project.organization, post.organization
        assert_equal @member, post.member
        assert_predicate post, :published?
        assert_in_delta Time.current, post.published_at, 2.seconds
      end
    end

    test "creates a post as draft if draft param is specified" do
      post = Post::CreatePost.new(member: @member, organization: @org, project: @project, params: { description_html: "<p>this is a description</p>", draft: true }).run

      assert_empty post.errors
      assert_predicate post, :persisted?
      assert_equal "<p>this is a description</p>", post.description_html
      assert_equal @project, post.project
      assert_equal @project.organization, post.organization
      assert_equal @member, post.member
      assert_predicate post, :draft?
      assert_nil post.published_at
    end

    test "creates event with skip_notifications param if specified" do
      post = Post::CreatePost.new(
        member: @member,
        organization: @org,
        project: @project,
        params: {
          description_html: "<p>this is a description</p>",
        },
        skip_notifications: true,
      ).run

      assert_predicate post.events.first, :skip_notifications?
    end

    test "trims title" do
      post = Post::CreatePost.new(member: @member, organization: @org, project: @project, params: { title: "  this is a title  ", description_html: "<p>this is a description</p>" }).run

      assert_empty post.errors
      assert_predicate post, :persisted?
      assert_equal "this is a title", post.title
    end

    context "with post attachments" do
      test "creates a post with attachments" do
        attachments = create_list(:attachment, 3, subject: nil)

        post = Post::CreatePost.new(
          organization: @org,
          member: @member,
          project: @project,
          params: {
            attachment_ids: attachments.map(&:public_id),
          },
        ).run

        assert_empty post.errors
        assert_predicate post, :persisted?
        assert_equal attachments.map(&:public_id), post.attachments.pluck(:public_id)
      end
    end

    context "with post links" do
      test "creates a post with links" do
        post = Post::CreatePost.new(
          member: @member,
          organization: @org,
          project: @project,
          params: {
            links: [{ name: "Campsite", url: "https://campsite.com" }],
          },
        ).run

        assert_empty post.errors
        assert_predicate post, :persisted?
        assert_equal 1, post.links.length
        assert_equal "Campsite", post.links.first.name
        assert_equal "https://campsite.com", post.links.first.url
      end

      test "returns an error for an invalid link param" do
        post = Post::CreatePost.new(
          member: @member,
          organization: @org,
          project: @project,
          params: {
            links: [{ name: "", url: "" }],
          },
        ).run

        assert_not_empty post.errors
        assert_empty post.links
        assert_match("Name can't be blank", post.errors.full_messages.first)
      end
    end

    context "with tags" do
      test "creates a post with a tag" do
        tag = create(:tag, organization: @org)
        post = Post::CreatePost.new(
          member: @member,
          organization: @org,
          project: @project,
          params: {
            description_html: "<p>this is a description</p>",
            tags: [tag.name],
          },
        ).run

        assert_empty post.errors
        assert_includes post.tags, tag
      end

      test "does not create a post with an invalid number of tags" do
        Post.stub_const(:POST_TAG_LIMIT, 1) do
          post = Post::CreatePost.new(
            member: @member,
            organization: @org,
            params: {
              description_html: "<p>this is a description</p>",
              tags: ["a", "b"],
            },
          ).run

          assert_not_empty post.errors
          assert_equal ["Post can have a max of 1 tags"], post.errors.full_messages
        end
      end
    end

    context "with parent" do
      test "creates a post with a parent" do
        parent = create(:post, organization: @org)
        post = Post::CreatePost.new(
          member: @member,
          organization: @org,
          parent: parent,
          project: @project,
          params: {
            description_html: "<p>this is a description</p>",
          },
        ).run

        assert_empty post.errors
        assert_includes post.ancestors, parent
        assert_empty post.descendants
      end

      test "does not create the post if the parent already has a child" do
        parent = create(:post, organization: @org)
        create(:post, organization: @org, parent: parent)
        post = Post::CreatePost.new(
          member: @member,
          organization: @org,
          parent: parent,
          params: {
            description_html: "<p>this is a description</p>",
          },
        ).run

        assert_not_empty post.errors
        assert_equal ["This post version already has an existing iteration."], post.errors.full_messages
      end

      test "creates a post and dups any parent project" do
        project = create(:project, organization: @org)
        parent = create(:post, organization: @org, project: project)
        post = Post::CreatePost.new(
          member: @member,
          organization: @org,
          parent: parent,
          project: @project,
          params: {
            description_html: "<p>this is a description</p>",
          },
        ).run

        assert_empty post.errors
        assert_equal project, post.project
      end
    end

    context "with poll" do
      test "creates a post with a poll" do
        post = Post::CreatePost.new(
          member: @member,
          organization: @org,
          project: @project,
          params: {
            poll: {
              description: "best sport",
              options: [
                { description: "option a" },
                { description: "option b" },
              ],
            },
          },
        ).run

        assert_empty post.errors
        assert_equal "best sport", post.poll.description
        assert_equal 2, post.poll.options.length
        assert_equal ["option a", "option b"], post.poll.options.map(&:description).sort
      end

      test "is invalid for a poll with less than 2 options" do
        post = Post::CreatePost.new(
          member: @member,
          organization: @org,
          params: {
            poll: {
              description: "best sport",
              options: [
                { description: "option a" },
              ],
            },
          },
        ).run

        assert_not_empty post.errors
        assert_equal ["A poll requires a minimum of 2 options and a maximum of 4 options."], post.errors.full_messages
      end

      test "is invalid for a poll with more than 4 options" do
        post = Post::CreatePost.new(
          member: @member,
          organization: @org,
          params: {
            poll: {
              description: "best sport",
              options: [
                { description: "option a" },
                { description: "option b" },
                { description: "option c" },
                { description: "option d" },
                { description: "option e" },
              ],
            },
          },
        ).run

        assert_not_empty post.errors
        assert_equal ["A poll requires a minimum of 2 options and a maximum of 4 options."], post.errors.full_messages
      end
    end

    context "with note" do
      test "updates unfurled link on post" do
        note = create(:note, member: @member)

        post = Post::CreatePost.new(
          member: @member,
          organization: @org,
          project: @project,
          params: {
            description_html: "<p>this is a description</p>",
            note_id: note.public_id,
          },
        ).run

        assert_empty post.errors
        assert_equal note.url, post.unfurled_link
      end
    end

    context "with feedback requests" do
      before do
        @feedback_request_member = create(:organization_membership, :member, organization: @org)
      end

      test "creates a post with feedback requests" do
        post = Post::CreatePost.new(
          member: @member,
          organization: @org,
          project: @project,
          params: {
            description_html: "<p>this is a description</p>",
            feedback_request_member_ids: [@feedback_request_member.public_id],
          },
        ).run

        assert_empty post.errors
        assert_equal 1, post.feedback_requests.length
        assert_equal @feedback_request_member.id, post.feedback_requests.first.member.id
        assert_equal 2, post.subscriptions.length
        assert_equal @member.user.id, post.subscriptions.first.user.id
        assert_equal @feedback_request_member.user.id, post.subscriptions.second.user.id
      end
    end
  end
end
