# frozen_string_literal: true

require "test_helper"

class MentionsFormatterTest < ActiveSupport::TestCase
  describe ".replace" do
    it "replaces multiple mentions" do
      members = create_list(:organization_membership, 3)
      text = "Yo <@#{members[0].public_id}> talk to <@#{members[1].public_id}> and <@#{members[2].public_id}>"
      expect = <<~HTML.squish
        Yo
        <span data-type="mention" data-id="#{members[0].public_id}" data-label="#{members[0].user.display_name}" data-role="member" data-username="#{members[0].user.username}">@#{members[0].user.display_name}</span>
        talk to
        <span data-type="mention" data-id="#{members[1].public_id}" data-label="#{members[1].user.display_name}" data-role="member" data-username="#{members[1].user.username}">@#{members[1].user.display_name}</span>
        and
        <span data-type="mention" data-id="#{members[2].public_id}" data-label="#{members[2].user.display_name}" data-role="member" data-username="#{members[2].user.username}">@#{members[2].user.display_name}</span>
      HTML

      assert_equal expect, MentionsFormatter.new(text).replace
    end

    it "replaces multiple mentions of the same member" do
      member = create(:organization_membership)
      text = "sup <@#{member.public_id}> i said sup <@#{member.public_id}>"
      expect = <<~HTML.squish
        sup
        <span data-type="mention" data-id="#{member.public_id}" data-label="#{member.user.display_name}" data-role="member" data-username="#{member.user.username}">@#{member.user.display_name}</span>
        i said sup
        <span data-type="mention" data-id="#{member.public_id}" data-label="#{member.user.display_name}" data-role="member" data-username="#{member.user.username}">@#{member.user.display_name}</span>
      HTML

      assert_equal expect, MentionsFormatter.new(text).replace
    end
  end

  describe ".replace_bracketed_display_names" do
    it "replaces multiple mentions" do
      org = create(:organization)
      members = [
        create(:organization_membership, organization: org, user: create(:user, name: "Alice")),
        create(:organization_membership, organization: org, user: create(:user, username: "foo_bar", name: nil)),
        create(:organization_membership, organization: org, user: create(:user, name: "Spongebob Squarepants")),
      ]
      text = "Yo [Alice] talk to [foo_bar] and [Spongebob Squarepants]"
      table = members.index_by { |member| member.user.display_name }
      expect = <<~HTML.squish
        Yo
        <span data-type="mention" data-id="#{members[0].public_id}" data-label="#{members[0].user.display_name}" data-role="member" data-username="#{members[0].user.username}">@#{members[0].user.display_name}</span>
        talk to
        <span data-type="mention" data-id="#{members[1].public_id}" data-label="#{members[1].user.display_name}" data-role="member" data-username="#{members[1].user.username}">@#{members[1].user.display_name}</span>
        and
        <span data-type="mention" data-id="#{members[2].public_id}" data-label="#{members[2].user.display_name}" data-role="member" data-username="#{members[2].user.username}">@#{members[2].user.display_name}</span>
      HTML

      assert_equal expect, MentionsFormatter.new(text).replace_bracketed_display_names(table)
    end

    it "replaces multiple mentions of the same member" do
      member = create(:organization_membership)
      text = "sup [#{member.user.display_name}] i said sup [#{member.user.display_name}]"
      table = { member.user.display_name => member }

      expect = <<~HTML.squish
        sup
        <span data-type="mention" data-id="#{member.public_id}" data-label="#{member.user.display_name}" data-role="member" data-username="#{member.user.username}">@#{member.user.display_name}</span>
        i said sup
        <span data-type="mention" data-id="#{member.public_id}" data-label="#{member.user.display_name}" data-role="member" data-username="#{member.user.username}">@#{member.user.display_name}</span>
      HTML

      assert_equal expect, MentionsFormatter.new(text).replace_bracketed_display_names(table)
    end

    it "falls back to bracketed name when no match" do
      member = create(:organization_membership)
      text = "sup [#{member.user.display_name}] i said sup [Spongebob]"
      table = { member.user.display_name => member }

      expect = <<~HTML.squish
        sup
        <span data-type="mention" data-id="#{member.public_id}" data-label="#{member.user.display_name}" data-role="member" data-username="#{member.user.username}">@#{member.user.display_name}</span>
        i said sup Spongebob
      HTML

      assert_equal expect, MentionsFormatter.new(text).replace_bracketed_display_names(table)
    end

    it "falls back when mapped to nil" do
      org = create(:organization)
      members = [
        create(:organization_membership, organization: org, user: create(:user, name: "Alice")),
        create(:organization_membership, organization: org, user: create(:user, username: "foo_bar", name: nil)),
      ]
      text = "Yo [Alice] talk to [foo_bar] and [Spongebob Squarepants]"
      table = members.index_by { |member| member.user.display_name }
      table["Spongebob Squarepants"] = nil
      expect = <<~HTML.squish
        Yo
        <span data-type="mention" data-id="#{members[0].public_id}" data-label="#{members[0].user.display_name}" data-role="member" data-username="#{members[0].user.username}">@#{members[0].user.display_name}</span>
        talk to
        <span data-type="mention" data-id="#{members[1].public_id}" data-label="#{members[1].user.display_name}" data-role="member" data-username="#{members[1].user.username}">@#{members[1].user.display_name}</span>
        and Spongebob Squarepants
      HTML

      assert_equal expect, MentionsFormatter.new(text).replace_bracketed_display_names(table)
    end
  end
end
