# frozen_string_literal: true

require "test_helper"

module Threads
  class UserTest < ActiveSupport::TestCase
    setup do
      @alex_user = Threads::User.new(
        <<~JSON,
          {"id":"34416161166","firstName":"Alex","lastName":"Talkanitsa","primaryEmail":"alex@finmid.com"}
        JSON
      )

      @linear_user = Threads::User.new(
        <<~JSON,
          {"id":"34431974988","firstName":"Linear","lastName":"","primaryEmail":null}
        JSON
      )
    end

    context "#primary_email_or_fallback" do
      test "returns primary email when exists" do
        assert_equal "alex@finmid.com", @alex_user.primary_email_or_fallback
      end

      test "returns a fallback when no primary email exists" do
        assert_equal "linear-34431974988@campsite.com", @linear_user.primary_email_or_fallback
      end
    end

    context "#full_name" do
      test "includes last name when present" do
        assert_equal "Alex Talkanitsa", @alex_user.full_name
      end

      test "only first name when no last name present" do
        assert_equal "Linear", @linear_user.full_name
      end
    end
  end
end
