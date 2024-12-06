# frozen_string_literal: true

class Post
  class UpdatePost
    def initialize(post:, actor:, organization:, project:, params: {})
      @post = post
      @actor = actor
      @organization = organization
      @project = project
      @params = params
    end

    def run
      if @params.key?(:title)
        @post.title = @params[:title].strip
      end

      @post.description_html = @params[:description_html] if @params.key?(:description_html)

      if @project
        @post.project = @project
      end

      if @params.key?(:note)
        @post.note = @params[:note]
      end

      if @params.key?(:unfurled_link)
        @post.unfurled_link = @params[:unfurled_link]
      end

      if @params.key?(:status)
        @post.status = @params[:status]
      end

      if @params.key?(:feedback_request_member_ids)
        members = @organization.kept_memberships
          .eager_load(:user).where(public_id: @params[:feedback_request_member_ids])
        previous_feedback_requests = @post.feedback_requests
          .eager_load(member: OrganizationMembership::SERIALIZER_EAGER_LOAD)

        requests = members.map do |member|
          # make sure all requested members are subscribed to the post
          unless @post.subscriptions.any? { |s| s.user_id == member.user_id }
            @post.subscriptions.create!(user: member.user)
          end

          # create a new feedback request if it doesn't exist
          if (feedback_request = previous_feedback_requests.find { |r| r.organization_membership_id == member.id })
            feedback_request.undiscard if feedback_request.discarded?
            feedback_request
          else
            previous_feedback_requests.create!(member: member)
          end
        end

        # discard any feedback requests that are not in the @params
        @post.feedback_requests.where.not(id: requests.pluck(:id))
          .discard_all_by_actor(@actor)

        # set the feedback requests so the serializer returns the latest
        @post.kept_feedback_requests = requests
      end

      if @params.key?(:attachment_ids)
        has_attachments = @params[:attachment_ids].present?
        attachments = has_attachments ? Attachment.in_order_of(:public_id, @params[:attachment_ids]) : []
        if has_attachments
          ids_and_positions = @params[:attachment_ids].each_with_index.map { |id, index| { id: id, position: index } }
          Attachment.reorder(ids_and_positions)
        end
        @post.attachments = attachments
      end

      @post.save!
    rescue ActiveRecord::RecordInvalid, ArgumentError => ex
      @post.errors.add(:base, ex.message)
      @post
    end
  end
end
