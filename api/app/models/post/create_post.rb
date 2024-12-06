# frozen_string_literal: true

class Post
  class CreatePost
    def initialize(params: {}, organization:, member: nil, parent: nil, project: nil, integration: nil, oauth_application: nil, skip_notifications: false)
      @title = params[:title]&.strip
      @description = params[:description]
      @description_html = params[:description_html]
      @attachment_ids = params[:attachment_ids] || []
      @links = params[:links] || []
      @tags = params[:tags] || []
      @feedback_request_member_ids = params[:feedback_request_member_ids] || []
      @member = member
      @organization = organization
      @parent = parent
      @project = project
      @poll = params[:poll]
      @post = Post.new
      @status = params[:status] || "none"
      @note = params[:note_id] ? @organization.notes.kept.find_by(public_id: params[:note_id]) : nil
      @unfurled_link = @note&.url || params[:unfurled_link]
      @integration = integration
      @oauth_application = oauth_application
      @skip_notifications = skip_notifications
      @from_message = Message.find_by(public_id: params[:from_message_id]) if params[:from_message_id]
      @draft = ActiveModel::Type::Boolean.new.cast(params[:draft]) || false

      # deprecating this object from the client on 5/22/24 in favor of `attachment_ids`.
      @attachments = params[:files] || params[:attachments] || []
    end

    def run
      if invalid_required_params?
        @post.errors.add(:base, "Post content or title is required.")
        return @post
      end

      if invalid_post_tags_limit?
        @post.errors.add(:base, "Post can have a max of #{Post::POST_TAG_LIMIT} tags")
        return @post
      end

      if parent_has_children?
        @post.errors.add(:base, "This post version already has an existing iteration.")
        return @post
      end

      if invalid_poll_options_limit?
        @post.errors.add(:base, "A poll requires a minimum of #{Poll::MIN_OPTIONS} options and a maximum of #{Poll::MAX_OPTIONS} options.")
        return @post
      end

      if @draft
        @post.workflow_state = :draft
      end

      ActiveRecord::Base.transaction do
        @post.assign_attributes(
          title: @title,
          description_html: @description_html,
          organization: @organization,
          project: @project,
          unfurled_link: @unfurled_link,
          parent: @parent,
          member: @member,
          tags: @organization.tags.where(name: @tags),
          status: @status,
          published_at: @draft ? nil : Time.current,
          oauth_application: @oauth_application,
          integration: @integration,
          skip_notifications: @skip_notifications,
          from_message: @from_message,
        )

        @post.save!

        create_attachments_from_ids unless @attachment_ids.empty?

        create_links unless @links.empty?
        Poll::CreatePoll.new(post: @post, description: @poll[:description], options_attributes: @poll[:options]).save! if @poll.present?
        create_feedback_requests unless @feedback_request_member_ids.empty?

        dup_parent_project if @parent&.project
        dismiss_ancestor_pending_feedback_requests if @parent

        @post
      end
    rescue ActiveRecord::RecordInvalid, ArgumentError => ex
      @post.errors.add(:base, ex.message)
      @post
    end

    private

    def invalid_required_params?
      @title.blank? && @description_html.blank? && @attachment_ids.empty? && @links.empty? && @poll.blank?
    end

    def invalid_post_tags_limit?
      @tags.length > Post::POST_TAG_LIMIT
    end

    def invalid_poll_options_limit?
      return false unless @poll
      return true unless @poll[:options]

      @poll[:options].length < Poll::MIN_OPTIONS || @poll[:options].length > Poll::MAX_OPTIONS
    end

    def create_links
      build_previews = @links.map do |link|
        {
          name: link[:name],
          url: link[:url],
        }
      end

      @post.links.create!(build_previews)
    end

    def create_attachments_from_ids
      @post.attachments = Attachment.in_order_of(:public_id, @attachment_ids)
    end

    def create_feedback_requests
      members = @organization.kept_memberships
        .where(public_id: @feedback_request_member_ids)
        .serializer_eager_load
      @post.kept_feedback_requests = @post.feedback_requests.create!(members.map { |member| { member: member } })
      @post.subscriptions.create!(members.map { |member| { user: member.user } })
    end

    def parent_has_children?
      return false unless @parent

      !@parent.leaf?
    end

    def dup_parent_tags
      @post.tags = @parent.tags
      @post.save!
    end

    def dup_parent_project
      @post.project = @parent.project
      @post.save!
    end

    def dismiss_ancestor_pending_feedback_requests
      PostFeedbackRequest.where(post: @post.ancestors, has_replied: false).discard_all
    end
  end
end
