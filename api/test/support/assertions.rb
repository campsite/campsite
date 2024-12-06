# frozen_string_literal: true

require "minitest/assertions"

module Minitest
  module Assertions
    def assert_response_gen_schema
      controller = request.controller_class
      action = request.params[:action]
      code = response.code

      schema = Apigen.app.get_validation_schema(controller, action, code, :response)

      if schema.nil?
        raise "no schema defined for #{controller}##{action}[#{code}]"
      end

      error_list = JSON::Validator.fully_validate(schema, response.body, string: false, version: :draft4, json: true)

      assert_empty(error_list)
    end

    # Asserts a sidekiq job has been enqueued with the provided options
    # @param [Class] worker class name
    # @param [Hash] opts
    #   @param [:args] the arguments sent to the worker
    #   @param [:at] scheduled job time
    #   @param [:in] scheduled job time
    #   @param [:queue] the queue name
    #
    def assert_enqueued_sidekiq_job(worker, opts = {})
      args = opts[:args].is_a?(Array) ? opts[:args] : [opts[:args]]
      queue = opts[:queue]
      count = opts[:count]
      perform_at = opts[:at]
      perform_in = opts[:in]

      jobs = if args.compact.empty?
        worker.jobs.select { |j| j["class"] == worker.to_s }
      else
        worker.jobs.select { |j| j["class"] == worker.to_s && j["args"] == args }
      end

      if count.present?
        assert_equal(count, jobs.size, "expected #{count} jobs, got #{jobs.size}")
      end

      job = jobs.first

      assert_not_nil(job, "no sidekiq job enqueued for #{worker}# with args #{args.flatten}")

      assertion = job["class"] == worker.to_s
      assertion &&= job["args"] == args if args.compact.present?
      assertion &&= at_evaluator(perform_at, job["at"]) if perform_at.present?
      assertion &&= in_evaluator(perform_in, job["at"]) if perform_in.present?
      assertion &&= job["queue"] == queue.to_s if queue.present?

      message = "no sidekiq job enqueued for #{worker}"
      message += " with args=#{args}"
      message += ", performed in=#{perform_in}" if perform_in.present?
      message += ", performed at=#{perform_at}" if perform_at.present?
      message += ", queue=#{queue}" if queue.present?

      assert(assertion, message)
    end

    # Refutes a sidekiq job has been enqueued with the provided options
    # @param [Class] worker class name
    # @param [Hash] opts
    #   @param [:args] the arguments sent to the worker
    #
    def refute_enqueued_sidekiq_job(worker, opts = {})
      args = opts[:args].is_a?(Array) ? opts[:args].compact : [opts[:args]].compact

      job = if args.empty?
        worker.jobs.find { |j| j["class"] == worker.to_s }
      else
        worker.jobs.find { |j| j["class"] == worker.to_s && j["args"] == args }
      end

      message = "expected #{job&.dig("class")} not to be enqueued"
      message += " with args=#{args}" if args.present?

      assert_nil(job, message)
    end

    def assert_enqueued_sidekiq_jobs(number, only: nil)
      if block_given?
        original_count = enqueued_jobs_size(only: only)
        yield
        new_count = enqueued_jobs_size(only: only)
        assert_equal(number, new_count - original_count, "#{number} jobs expected, but #{new_count - original_count} were enqueued")
      else
        actual_count = enqueued_jobs_size(only: only)
        assert_equal(number, actual_count, "#{number} jobs expected, but #{actual_count} were enqueued")
      end
    end

    private

    def at_evaluator(value, job_at)
      value.to_time.to_i == Time.at(job_at).to_i
    end

    def in_evaluator(value, job_at)
      (Time.zone.now + value).to_i == Time.at(job_at).to_i
    end

    def enqueued_jobs_size(only:)
      enqueued_jobs = Sidekiq::Worker.jobs
      enqueued_jobs.count do |job|
        if only
          next false unless Array(only.to_s).include?(job["class"])
        end
        true
      end
    end
  end
end
