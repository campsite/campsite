# frozen_string_literal: true

require "test_helper"

class DeviseMailerTest < ActionMailer::TestCase
  setup do
    @user = create(:user)
    @app_mailer = ApplicationMailer.new
  end

  context "password_change" do
    setup do
      @mail = DeviseMailer.password_change(@user).deliver_now
      @html_body = @mail.html_part.body.to_s
    end

    test "renders a subject" do
      assert_equal "Your password has changed", @mail.subject
    end

    test "renders the receiver email" do
      assert_equal @user.email, @mail[:to].to_s
    end

    test "renders the sender email" do
      assert_equal @app_mailer.noreply_email, @mail[:from].to_s
    end

    test "renders a password change info" do
      assert_includes @html_body, "Your password has changed"
    end
  end

  context "email_changed" do
    setup do
      @mail = DeviseMailer.email_changed(@user).deliver_now
      @html_body = @mail.html_part.body.to_s
    end

    test "renders a subject" do
      assert_equal "Your email has changed", @mail.subject
    end

    test "renders the receiver email" do
      assert_equal @user.email, @mail[:to].to_s
    end

    test "renders the sender email" do
      assert_equal @app_mailer.noreply_email, @mail[:from].to_s
    end

    test "renders an email change info" do
      assert_includes @html_body, "Your email was changed to <b>#{@user.email}</b>"
    end
  end

  context "reset_password_instructions" do
    setup do
      @token = "token"
      @mail = DeviseMailer.reset_password_instructions(@user, @token).deliver_now
      @html_body = @mail.html_part.body.to_s
    end

    test "renders a subject" do
      assert_equal "Reset your password", @mail.subject
    end

    test "renders the receiver email" do
      assert_equal @user.email, @mail[:to].to_s
    end

    test "renders the sender email" do
      assert_equal @app_mailer.noreply_email, @mail[:from].to_s
    end

    test "renders reset password url" do
      assert_includes @html_body, "/password/edit?reset_password_token=#{@token}"
    end
  end

  context "confirmation_instructions" do
    setup do
      @token = "token"
      @mail = DeviseMailer.confirmation_instructions(@user, @token).deliver_now
      @html_body = @mail.html_part.body.to_s
    end

    test "renders a subject" do
      assert_equal "Confirm your email", @mail.subject
    end

    test "renders the receiver email" do
      assert_equal @user.email, @mail[:to].to_s
    end

    test "renders the sender email" do
      assert_equal @app_mailer.noreply_email, @mail[:from].to_s
    end

    test "renders confirmation url" do
      assert_includes @html_body, "/confirmation?confirmation_token=#{@token}"
    end
  end

  context "email changed" do
    setup do
      @token = "token"
      # triggers devise to set uncormfirmed_email
      @user.update(email: "foo+1@bar.com")
      @mail = DeviseMailer.confirmation_instructions(@user, @token).deliver_now
      @html_body = @mail.html_part.body.to_s
    end

    test "renders a subject" do
      assert_equal "Confirm your email change", @mail.subject
    end

    test "renders the receiver email" do
      assert_equal @user.email, @mail[:to].to_s
    end

    test "renders the sender email" do
      assert_equal @app_mailer.noreply_email, @mail[:from].to_s
    end

    test "renders confirmation url" do
      assert_includes @html_body, "/confirmation?confirmation_token=#{@token}"
    end
  end
end
