# frozen_string_literal: true

class ZapierComment
  include ActiveModel::Model

  attr_accessor :content, :post_id, :parent_id, :integration, :organization, :oauth_application

  validates :content, presence: true
  validate :post_id_or_parent_id
  validate :post_ownership, if: -> { post_id.present? }
  validate :parent_ownership, if: -> { parent_id.present? }

  def create!
    validate!

    comment = Comment.create_comment(
      params: { body_html: body_html },
      member: nil,
      subject: post,
      parent: parent,
      integration: integration,
      oauth_application: oauth_application,
    )

    raise ActiveModel::ValidationError, comment if comment.errors.present?

    comment
  end

  private

  def post_id_or_parent_id
    errors.add(:base, "post_id or parent_id must be present") if !post_id && !parent_id
    errors.add(:base, "post_id and parent_id cannot both be present") if post_id && parent_id
  end

  def post_ownership
    errors.add(:base, "Post does not belong to this organization") if post.organization != organization
  end

  def parent_ownership
    errors.add(:base, "Parent comment does not belong to this organization") if parent.subject.organization != organization
  end

  def post
    return if post_id.blank?

    @post ||= Post.includes(:project).find_by!(public_id: post_id)
  end

  def parent
    return if parent_id.blank?

    @parent ||= Comment.includes(subject: :organization).find_by!(public_id: parent_id)
  end

  def body_html
    markdown = <<~MARKDOWN.strip
      #{content}
    MARKDOWN

    enriched = MentionsFormatter.new(markdown).replace
    client = StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken))
    html = client.markdown_to_html(markdown: enriched, editor: "markdown")

    html
  rescue StyledText::StyledTextError => e
    Sentry.capture_exception(e)
    fallback_body_html
  end

  def fallback_body_html
    "<p>#{content}</p>"
  end
end
