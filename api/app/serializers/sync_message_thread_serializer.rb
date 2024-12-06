# frozen_string_literal: true

class SyncMessageThreadSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :image_url, nullable: true
  api_association :avatar_urls, blueprint: AvatarUrlsSerializer, nullable: true
  api_field :group, type: :boolean

  api_field :title do |thread, opts|
    thread.formatted_title(opts[:member])
  end

  api_field :project_id, nullable: true do |thread|
    thread.project&.public_id
  end

  api_association :dm_other_member, blueprint: SyncOrganizationMemberSerializer, nullable: true do |thread, opts|
    if !thread.group? && opts[:member]
      thread.other_members(opts[:member]).first
    end
  end
end
