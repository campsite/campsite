# frozen_string_literal: true

class ReplyCreatedSerializer < ApiSerializer
  api_association :reply, blueprint: CommentSerializer
  api_association :attachment, nullable: true, blueprint: AttachmentSerializer
  api_association :attachment_commenters, nullable: true, is_array: true, blueprint: OrganizationMemberSerializer
end
