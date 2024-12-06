# frozen_string_literal: true

module SlackTestHelper
  def slack_request_signature_headers(params:)
    signing_secret = Rails.application.credentials.slack.signing_secret
    digest = OpenSSL::Digest.new("SHA256")
    timestamp = Time.current.to_i
    base_string = ["v0", timestamp, params.to_json].join(":")
    hex_hash = OpenSSL::HMAC.hexdigest(digest, signing_secret, base_string)
    computed_signature = ["v0", hex_hash].join("=")

    {
      "HTTP_X_SLACK_REQUEST_TIMESTAMP" => timestamp,
      "HTTP_X_SLACK_SIGNATURE" => computed_signature,
    }
  end

  def stub_conversations_info(id:, name:, is_private: false)
    Slack::Web::Client.any_instance.stubs(:conversations_info).returns(
      {
        "ok" => true,
        "channel" => {
          "id" => id,
          "name" => name,
          "is_channel" => true,
          "is_group" => false,
          "is_im" => false,
          "created" => 1449252889,
          "creator" => "W012A3BCD",
          "is_archived" => false,
          "is_general" => true,
          "unlinked" => 0,
          "name_normalized" => "general",
          "is_read_only" => false,
          "is_shared" => false,
          "parent_conversation" => nil,
          "is_ext_shared" => false,
          "is_org_shared" => false,
          "pending_shared" => [],
          "is_pending_ext_shared" => false,
          "is_member" => true,
          "is_private" => is_private,
          "is_mpim" => false,
          "last_read" => "1502126650.228446",
          "topic" => {
            "value" => "For public discussion of generalities",
            "creator" => "W012A3BCD",
            "last_set" => 1449709364,
          },
          "purpose" => {
            "value" => "This part of the workspace is for fun. Make fun here.",
            "creator" => "W012A3BCD",
            "last_set" => 1449709364,
          },
          "previous_names" => [
            "specifics",
            "abstractions",
            "etc",
          ],
          "locale" => "en-US",
        },
      },
    )
  end
end
