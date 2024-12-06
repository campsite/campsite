# frozen_string_literal: true

require "test_helper"

class UserMailerTest < ActionMailer::TestCase
  setup do
    @app_mailer = ApplicationMailer.new
  end

  describe "#membership_request_accepted" do
    setup do
      @request = create(:organization_membership_request, organization: create(:organization, name: "FooBarBaz"))
      @mail = described_class.membership_request_accepted(@request.user, @request.organization).deliver_now
      @html_body = @mail.html_part.body.to_s
    end

    test "renders a subject" do
      assert_equal "Your request to join FooBarBaz on Campsite was approved", @mail.subject
    end

    test "renders the receiver email" do
      assert_equal @request.user.email, @mail[:to].to_s
    end

    test "renders the sender email" do
      assert_equal @app_mailer.noreply_email, @mail[:from].to_s
    end

    test "renders the org url" do
      assert_includes @html_body, @request.organization.url
    end
  end
end
