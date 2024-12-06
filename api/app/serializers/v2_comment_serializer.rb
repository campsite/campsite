# frozen_string_literal: true

class V2CommentSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :body_html, name: :content, default: ""
  api_field :created_at
  api_field :replies_count, type: :number

  api_field :parent_id, nullable: true do |comment|
    comment&.parent&.public_id
  end

  api_field :subject_id do |comment|
    comment.subject.public_id
  end
  api_field :subject_type do |comment|
    comment.subject_type.underscore
  end

  api_association :author, blueprint: V2AuthorSerializer
end
