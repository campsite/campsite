# frozen_string_literal: true

require "action_mailer/test_helper"

module ActionMailer
  module TestHelper
    def assert_enqueued_email_with(mail, method, opts = {})
      job = enqueued_email_jobs.find do |job|
        job["args"].first["arguments"].first == mail.to_s &&
          job["args"].first["arguments"].second == method.to_s &&
          job["args"].first["arguments"].fourth["args"] == ActiveJob::Arguments.serialize(opts[:args])
      end

      assert_not_nil(job, "no email enqueued")
    end

    def refute_enqueued_email_with(mail, method, opts = {})
      job = enqueued_email_jobs.find do |job|
        job["args"].first["arguments"].first == mail.to_s &&
          job["args"].first["arguments"].second == method.to_s &&
          job["args"].first["arguments"].fourth["args"] == ActiveJob::Arguments.serialize(opts[:args])
      end

      assert_nil(job, "email enqueued")
    end

    def assert_enqueued_emails(number, &block)
      actual_count = if block_given?
        original_jobs = enqueued_email_jobs
        block.call
        new_jobs = enqueued_email_jobs
        (new_jobs - original_jobs).size
      else
        enqueued_email_jobs.count
      end

      assert_equal(number, actual_count, "#{number} enqueued emails expected, enqueued #{actual_count}")
    end

    def assert_no_enqueued_emails(&block)
      assert_enqueued_emails(0, &block)
    end

    private

    def enqueued_email_jobs
      ActiveJob::QueueAdapters::SidekiqAdapter::JobWrapper.jobs.select do |job|
        job["wrapped"] == "ActionMailer::MailDeliveryJob"
      end
    end
  end
end
