# frozen_string_literal: true

module Apigen
  module Controller
    def _dsl_data
      @_dsl_data ||= {
        api: false,
        code: 0,
        response_schema: nil,
        response_options: {},
        request_schema: nil,
        request_options: {},
        description: nil,
        summary: nil,
        private: false,
      }
    end

    def _dsl_data_clear
      @_dsl_data = nil
    end

    def response(options = {}, &block)
      return if Rails.env.production?

      _dsl_data[:api] = true
      _dsl_data[:code] = options[:code] || 200
      _dsl_data[:response_schema] = Apigen.app.schema_from_options_or_block(options, &block)
      _dsl_data[:response_options] = options
    end

    def request_params(options = {}, &block)
      return if Rails.env.production?

      _dsl_data[:api] = true
      _dsl_data[:request_schema] = Apigen.app.schema_from_options_or_block(options, &block)
      _dsl_data[:request_options] = options
    end

    def method_added(method_name)
      super
      return if Rails.env.production?
      return unless _dsl_data[:api]

      Apigen.app.add_description(self, method_name, _dsl_data)

      _dsl_data_clear
    ensure
      _dsl_data_clear
    end

    def api_summary(summary)
      return if Rails.env.production?

      _dsl_data[:api] = true
      _dsl_data[:summary] = summary
    end

    def api_description(description)
      return if Rails.env.production?

      _dsl_data[:api] = true
      _dsl_data[:description] = description.strip
    end

    def api_private
      return if Rails.env.production?

      _dsl_data[:private] = true
    end

    def order_schema(by:)
      {
        order:
          {
            type: :object,
            properties: {
              by: { type: :string, enum: by },
              direction: { type: :string, enum: ["asc", "desc"] },
            },
            required: false,
          },
      }
    end

    def v2_order_schema(by:)
      {
        sort: {
          type: :string,
          enum: by,
          required: false,
        },
        direction: {
          type: :string,
          enum: ["asc", "desc"],
          required: false,
        },
      }
    end
  end
end
