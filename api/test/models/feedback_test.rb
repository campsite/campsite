# frozen_string_literal: true

require "test_helper"

class FeedbackTest < ActiveSupport::TestCase
  context "#generate_avatar_presigned_post_fields" do
    test "returns an presigned fields for the org avatar" do
      org = create(:organization)
      fields = Feedback.generate_presigned_fields(org, "image/png")

      assert fields.is_a?(PresignedPostFields)
      assert_match(%r{o/#{org.public_id}/fb/[A-Za-z0-9-]{36}\.png}, fields.key)
    end
  end

  context "#plain_components" do
    test "returns an array of Plain components" do
      feedback = create(:feedback)
      expected = [
        { componentPlainText: { plainText: feedback.description } },
        { componentSpacer: { spacerSize: "M" } },
        {
          componentLinkButton: {
            linkButtonLabel: "Screenshot", linkButtonUrl: "http://campsite-test.imgix.net#{feedback.screenshot_path}",
          },
        },
        { componentSpacer: { spacerSize: "M" } },
        {
          componentRow: {
            rowMainContent: [{ componentText: { text: "Organization", textColor: "MUTED" } }],
            rowAsideContent: [{ componentText: { text: feedback.organization.name, textColor: "NORMAL" } }],
          },
        },
        { componentSpacer: { spacerSize: "XS" } },
        {
          componentRow: {
            rowMainContent: [{ componentText: { text: "Page", textColor: "MUTED" } }],
            rowAsideContent: [{ componentText: { text: feedback.current_url, textColor: "NORMAL" } }],
          },
        },
        { componentSpacer: { spacerSize: "XS" } },
        {
          componentRow: {
            rowMainContent: [{ componentText: { text: "Browser", textColor: "MUTED" } }],
            rowAsideContent: [{ componentText: { text: feedback.browser_info, textColor: "NORMAL" } }],
          },
        },
        { componentSpacer: { spacerSize: "XS" } },
        {
          componentRow: {
            rowMainContent: [{ componentText: { text: "OS", textColor: "MUTED" } }],
            rowAsideContent: [{ componentText: { text: feedback.os_info, textColor: "NORMAL" } }],
          },
        },
      ]

      assert_equal expected, feedback.plain_components.map(&:to_h)
    end
  end
end
