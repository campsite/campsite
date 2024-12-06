# frozen_string_literal: true

class MentionsFormatter
  def initialize(text)
    @text = text
  end

  def self.format_mention(app_or_member)
    public_id = app_or_member.public_id
    display_name = app_or_member.display_name
    username = app_or_member.username
    role = app_or_member.mention_role_name

    <<~HTML.squish
      <span data-type="mention" data-id="#{public_id}" data-label="#{display_name}" data-role="#{role}" data-username="#{username}">@#{display_name}</span>
    HTML
  end

  def replace
    re = /<@([a-zA-Z0-9]{#{PublicIdGenerator::PUBLIC_ID_LENGTH}})>/
    member_public_ids = @text.scan(re).flatten.uniq
    members = OrganizationMembership.where(public_id: member_public_ids).eager_load(:user).index_by(&:public_id)
    members.each do |public_id, member|
      @text = @text.gsub("<@#{public_id}>", self.class.format_mention(member))
    end

    @text
  end

  def replace_bracketed_display_names(display_name_to_member)
    display_name_to_member.compact.each do |display_name, member|
      @text = @text.gsub("[#{display_name}]", self.class.format_mention(member))
    end

    @text = @text.gsub(/[\[\]]/, "")

    @text
  end
end
