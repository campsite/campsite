# frozen_string_literal: true

require "test_helper"

class RichTextTest < ActiveSupport::TestCase
  describe "#replace_resource_mentions_with_links" do
    it "converts resource mentions to links" do
      organization = create(:organization)
      post = create(:post, title: "Post title", organization: organization)
      call = create(:call, title: "Call title", room: create(:call_room, organization: organization))
      note = create(:note, title: "Note title", member: create(:organization_membership, organization: organization))
      untitled_post = create(:post, title: nil, organization: organization)
      other_org_post = create(:post, title: "Other org post title")

      html = <<~HTML.squish
        <resource-mention href="#{post.url}"></resource-mention>
        <resource-mention href="#{call.url}"></resource-mention>
        <resource-mention href="#{note.url}"></resource-mention>
        <resource-mention href="#{untitled_post.url}"></resource-mention>
        <resource-mention href="#{other_org_post.url}"></resource-mention>
      HTML

      expected = <<~TEXT.strip
        <a href="#{post.url}">Post title</a> <a href="#{call.url}">Call title</a> <a href="#{note.url}">Note title</a> <a href="#{untitled_post.url}">#{untitled_post.url}</a> <a href="#{other_org_post.url}">#{other_org_post.url}</a>
      TEXT

      assert_equal expected, RichText.new(html).replace_resource_mentions_with_links(organization).to_s
    end
  end

  describe "#replace_link_unfurls_with_links" do
    it "converts link unfurls to links" do
      html = <<~HTML.squish
        <link-unfurl href="https://campsite.com"></link-unfurl>
        <link-unfurl href="https://google.com"></link-unfurl>
      HTML

      expected = <<~TEXT.strip
        <a href="https://campsite.com">https://campsite.com</a> <a href="https://google.com">https://google.com</a>
      TEXT

      assert_equal expected, RichText.new(html).replace_link_unfurls_with_links.to_s
    end
  end
end
