# frozen_string_literal: true

class PublicNoteSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :title, default: ""
  api_field :description_html, default: ""
  api_field :created_at
  api_field :public_share_url, name: :url

  api_field :og_user_avatar do |note, _options|
    note.member.user.avatar_url(size: 40)
  end

  api_field :og_org_avatar do |_note, options|
    options[:organization].avatar_url(size: 56)
  end

  api_association :member, blueprint: PublicOrganizationMemberSerializer
  api_association :organization, blueprint: PublicOrganizationSerializer do |_note, options|
    options[:organization]
  end
end
