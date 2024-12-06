# frozen_string_literal: true

class CommentCreatedSerializer < ApiSerializer
  api_association :preview_commenters, blueprint: CommentersSerializer
  api_association :post_comment, blueprint: CommentSerializer
  api_association :attachment, nullable: true, blueprint: AttachmentSerializer
  api_association :attachment_commenters, nullable: true, is_array: true, blueprint: OrganizationMemberSerializer
end
