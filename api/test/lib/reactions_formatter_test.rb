# frozen_string_literal: true

require "test_helper"

class ReactionsFormatterTest < ActiveSupport::TestCase
  setup do
    @organization = create(:organization)
  end

  describe ".format_reaction" do
    it "formats a reaction correctly" do
      reaction = create(:custom_reaction, organization: @organization)

      expected_html = <<~HTML.chomp
        <img src="#{reaction.file_url}" alt="#{reaction.name}" draggable="false" data-type="reaction" data-id="#{reaction.public_id}" data-name="#{reaction.name}" />
      HTML

      assert_equal expected_html, reaction.to_html
    end
  end

  describe "#replace" do
    it "replaces multiple reactions" do
      reactions = [
        create(:custom_reaction, organization: @organization, name: "blob-1", file_path: "/blob-1.png"),
        create(:custom_reaction, organization: @organization, name: "blob-2", file_path: "/blob-2.png"),
      ]

      text = ":blob-1: Hello :blob-1: World :blob-2:"
      expected_output = "#{reactions[0].to_html} Hello #{reactions[0].to_html} World #{reactions[1].to_html}"

      assert_equal expected_output, ReactionsFormatter.new(text, organization: @organization).replace
    end

    it "ignores unknown reactions" do
      reaction = create(:custom_reaction, name: "known", file_path: "/known.png", organization: @organization)

      text = "Known :known: and unknown :unknown:"
      expected_output = "Known #{reaction.to_html} and unknown :unknown:"

      assert_equal expected_output, ReactionsFormatter.new(text, organization: @organization).replace
    end

    it "doesn't replace reactions for a different organization" do
      create(:custom_reaction, name: "known", file_path: "/known.png")

      text = "Known :known:"

      assert_equal text, ReactionsFormatter.new(text, organization: @organization).replace
    end

    it "handles text without reactions" do
      text = "Plain text without reactions"

      assert_equal text, ReactionsFormatter.new(text, organization: @organization).replace
    end

    it "handles empty text" do
      assert_equal "", ReactionsFormatter.new("", organization: @organization).replace
    end
  end
end
