# frozen_string_literal: true

class V2AppMentionSubjectSerializer < ApiSerializer
  POST_TYPE = "post"
  COMMENT_TYPE = "comment"
  MESSAGE_TYPE = "message"

  api_field :type, enum: [POST_TYPE, COMMENT_TYPE, MESSAGE_TYPE] do |subject|
    subject.api_type_name.underscore
  end

  api_association :post, if: ->(_field_name, subject, _options) { subject.api_type_name.underscore == POST_TYPE }, blueprint: V2PostSerializer do |subject|
    subject
  end

  api_association :comment, if: ->(_field_name, subject, _options) { subject.api_type_name.underscore == COMMENT_TYPE }, blueprint: V2CommentSerializer do |subject|
    subject
  end

  api_association :message, if: ->(_field_name, subject, _options) { subject.api_type_name.underscore == MESSAGE_TYPE }, blueprint: V2MessageSerializer do |subject|
    subject
  end
end
