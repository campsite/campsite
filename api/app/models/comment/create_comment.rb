# frozen_string_literal: true

class Comment
  class CreateComment
    CREATE_COMMENT_REQUEST_PARAMS = {
      body_html: { type: :string, nullable: true },
      attachments: {
        type: :object,
        is_array: true,
        required: false,
        properties: {
          file_path: { type: :string },
          file_type: { type: :string },
          preview_file_path: { type: :string, required: false, nullable: true },
          width: { type: :number, required: false },
          height: { type: :number, required: false },
          duration: { type: :number, required: false },
          name: { type: :string, required: false, nullable: true },
          size: { type: :number, required: false, nullable: true },
        },
      },
      attachment_ids: { type: :string, is_array: true, required: false },
      x: { type: :number, required: false, nullable: true },
      y: { type: :number, required: false, nullable: true },
      file_id: { type: :string, required: false, nullable: true },
      timestamp: { type: :number, required: false, nullable: true },
      note_highlight: { type: :string, required: false, nullable: true },
    }.freeze

    def initialize(params: {}, member: nil, subject:, parent:, integration: nil, oauth_application: nil, skip_notifications: false)
      @attachments = params[:attachments] || []
      @attachment_ids = params[:attachment_ids] || []

      @new_comment = if parent
        parent.kept_replies.new(x: params[:x], y: params[:y], subject: parent.subject)
      else
        subject.comments.new(x: params[:x], y: params[:y])
      end

      attachment = if parent
        parent.attachment
      else
        params[:file_id] ? Attachment.find_by(public_id: params[:file_id]) : nil
      end

      @new_comment.assign_attributes(
        body_html: params[:body_html],
        attachment: attachment,
        timestamp: params[:timestamp],
        note_highlight: params[:note_highlight],
        member: member,
        skip_notifications: skip_notifications,
        integration: integration,
        oauth_application: oauth_application,
      )
    end

    def run
      if missing_body_and_attachments?
        @new_comment.errors.add(:base, "must have either body or attachments")
        return @new_comment
      end

      if invalid_nesting_level?
        @new_comment.errors.add(:base, "can't be nested more than one level deep")
        return @new_comment
      end

      ActiveRecord::Base.transaction do
        @new_comment.save!

        if @attachment_ids.any?
          create_attachments_from_ids
        elsif @attachments.any?
          create_attachments_from_objects
        end

        @new_comment
      end
    rescue ActiveRecord::RecordInvalid => ex
      @new_comment.errors.add(:base, ex.message)
      @new_comment
    end

    private

    def create_attachments_from_objects
      build_attachments = @attachments.map do |attachment|
        {
          file_path: attachment[:file_path],
          file_type: attachment[:file_type],
          duration: attachment[:duration],
          preview_file_path: attachment[:preview_file_path],
          width: attachment[:width],
          height: attachment[:height],
          name: attachment[:name],
          size: attachment[:size],
        }
      end

      @new_comment.attachments.create!(build_attachments)
    end

    def create_attachments_from_ids
      @new_comment.attachments = Attachment.in_order_of(:public_id, @attachment_ids)
    end

    def missing_body_and_attachments?
      @new_comment.body_html.blank? && (@attachments.empty? || @attachment_ids.any?)
    end

    def invalid_nesting_level?
      @new_comment.parent.present? && @new_comment.parent.parent.present?
    end
  end
end
