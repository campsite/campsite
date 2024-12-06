# frozen_string_literal: true

require "test_helper"

class PlainClientTest < ActiveSupport::TestCase
  setup do
    @client = PlainClient.new(api_key: Rails.application.credentials.dig(:plain, :api_key))
  end

  describe "#upsert_customer" do
    test "creates a customer" do
      VCR.use_cassette("plain/upsert_customer") do
        result = @client.upsert_customer(
          external_id: "123",
          full_name: "Hermione Granger",
          short_name: "Hermione",
          email: "hermione@campsite.com",
        )

        assert_equal "NOOP", result.dig("data", "upsertCustomer", "result")
      end
    end

    test "raises exception if result includes error" do
      VCR.use_cassette("plain/upsert_customer_error") do
        assert_raises PlainClient::CustomerAlreadyExistsWithEmailError do
          @client.upsert_customer(
            external_id: "different-id-same-email",
            full_name: "Hermione Granger",
            short_name: "Hermione",
            email: "hermione@campsite.com",
          )
        end
      end
    end
  end

  describe "#create_thread" do
    test "creates a thread" do
      VCR.use_cassette("plain/create_thread") do
        result = @client.create_thread(
          customer_external_id: "123",
          title: "It's levio-sah",
          components: [
            Plain::Components::PlainText.new(plain_text: "Please make the update to your website posthaste."),
            Plain::Components::Spacer.new,
            Plain::Components::LinkButton.new(link_button_label: "attachment.jpg", link_button_url: "https://media.campsite.test/u/1/attachment.jpg"),
          ],
          label_type_ids: ["lt_01HKXK5B9WTSVHQ95HGQVNATYW"],
        )

        assert_predicate result.dig("data", "createThread", "thread", "id"), :present?
      end
    end
  end
end
