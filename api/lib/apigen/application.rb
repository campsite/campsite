# frozen_string_literal: true

require "active_support/core_ext/object"

module Apigen
  module BaseUrlExtension
    attr_accessor :base_url
  end
end

module ActionDispatch
  module Journey
    class Route
      include Apigen::BaseUrlExtension
    end
  end
end

module Apigen
  class ResourceDescription
    attr_accessor :controller, :method, :path, :verb, :name, :code, :original_schemas, :schema_refs, :schema_options, :description, :summary, :private

    def initialize(controller:, method:, path:, verb:, name:, dsl_data:)
      @controller = controller
      @method = method
      @path = path
      @verb = verb
      @name = name
      @code = dsl_data[:code]
      @summary = dsl_data[:summary]
      @description = dsl_data[:description]
      @private = dsl_data[:private]
      @original_schemas = {
        request: dsl_data[:request_schema],
        response: dsl_data[:response_schema],
      }
      @schema_refs = {
        request: nil,
        response: nil,
      }
      @schema_options = {
        request: dsl_data[:request_options] || {},
        response: dsl_data[:response_options] || {},
      }
    end

    def base_schema_name
      @base_schema_name ||= ((@name || @path.delete_prefix("/v1/").gsub(":", "")).split("/") + [@verb]).join("_").downcase
    end
  end

  class Application
    SWAGGER_TYPES = [:string, :number, :integer, :boolean, :object].to_set.freeze

    def initialize
      super
      init_env
    end

    def init_env
      # collects method descriptions when method_added is called on methods with request/response annotations
      @descriptions ||= []
      # stored resources built from descriptions
      @resources ||= {}
      # hash of schmeas keyed by controller, method, code, type or the parent schema
      @schemas ||= {}
    end

    def resource_key(controller, method, code)
      [controller, method, code].join("_")
    end

    def schema_key(controller, method, code, type)
      raise "resource_type must be 'request' or 'response'" unless [:request, :response].include?(type)

      [controller, method, code, type].join("_")
    end

    def resource_schema_key(resource, type)
      schema_key(resource[:controller], resource[:method], resource[:code], type)
    end

    def validation_schema(schema)
      copy = schema.deep_dup

      schema.each do |key, value|
        if value.is_a?(Hash)
          copy[key] = validation_schema(value)
        elsif value.is_a?(Array)
          copy[key] = value.map do |item|
            if item.is_a?(Hash)
              validation_schema(item)
            else
              item
            end
          end
        end
      end

      # json schema validation spec does not support "nullable" field
      # must include it as a type (which swagger does not support!)
      if copy[:nullable]
        if copy["$ref"]
          copy[:oneOf] = [
            { type: :null },
            { "$ref": copy["$ref"] },
          ]
          copy.delete("$ref")
        else
          copy[:type] = copy[:type] ? [copy[:type], :null] : :null
        end
      end

      copy
    end

    def validation_components
      @validation_components ||= begin
        components = {
          schemas: {},
        }

        @schemas.each do |name, schema|
          components[:schemas][name] = validation_schema(schema)
        end

        components
      end
    end

    def get_validation_schema(controller, method, code, type)
      build_resources

      key = resource_key(controller, method, code)
      if (resource = @resources[key])
        schema_name = resource.schema_refs[type]
        # if there is a resource but no schema, the schema is likely empty
        # return an empty schema
        schema = validation_schema(@schemas[schema_name] || {})

        options = resource.schema_options[type]
        if options[:is_array] == true
          schema = {
            type: :array,
            items: schema,
          }
        end

        # support root request/response nullability
        if options[:nullable]
          schema[:type] = [schema[:type], :null]
        end

        # include all component schemas so $refs still work
        schema.merge({ components: validation_components })
      end
    end

    def build_resource_root_ref(resource, type)
      original_schema = resource.original_schemas[type]

      return unless original_schema

      schema_name = resource.base_schema_name + "_" + type.to_s

      resource.schema_refs[type] = if (model = original_schema[:model])
        build_model_ref(model)
      else
        build_schema_ref(schema_name, original_schema)
      end
    end

    def build_model_ref(model)
      model_name = if model.respond_to?(:schema_name)
        model.schema_name
      else
        model.name.demodulize.gsub("Serializer", "")
      end

      raise "model must response to self.schema_description" unless model.respond_to?(:schema_description)

      build_schema_ref(model_name, { type: :object, properties: model.schema_description })
    end

    def normalize_schema(schema)
      normalized = {}

      if (model = schema[:model])
        normalized["$ref"] = swagger_ref_path(build_model_ref(model))
      else
        raise "schema must have a type #{schema}" unless schema[:type] || schema["$ref"]
        raise "schema type must be one of #{SWAGGER_TYPES.to_a} #{schema}" unless schema["$ref"] || SWAGGER_TYPES.include?(schema[:type])

        normalized[:type] = schema[:type]
        normalized[:enum] = schema[:enum]
        normalized[:required] = schema[:properties]&.map { |key, value| value[:required] != false ? key : nil }&.compact
        normalized[:description] = schema[:description] if schema[:description]

        if (properties = schema[:properties] || {})
          normalized[:properties] = properties.map do |key, value|
            [key, normalize_schema(value)]
          end.to_h
        end
      end

      normalized[:nullable] = schema[:nullable] == true || nil
      normalized[:additionalProperties] = schema[:additional_properties]

      normalized = normalized.compact

      is_array = schema[:is_array] == true
      if is_array
        nullable = normalized[:nullable]
        normalized.delete(:nullable)
        normalized = { items: normalized }
        normalized[:type] = :array
        normalized[:nullable] = nullable unless nullable.nil?
      end

      normalized
    end

    # expects a name of the schema and a hash definition. e.g:
    # { type: :object, properties: { name: { type: :string } }
    # returns the name of the schema within the @schema hash
    def build_schema_ref(name, schema)
      return name if @schemas[name]

      # avoid infinite recursion
      @normalized_name_stack ||= []
      return name if @normalized_name_stack.include?(name)

      @normalized_name_stack << name
      @schemas[name] = normalize_schema(schema)
      @normalized_name_stack.pop

      name
    end

    def build_resources
      return if @resources.any?

      @descriptions.map do |controller, method_name, dsl_data|
        routes_for_action(controller, method_name).map do |route|
          resource = ResourceDescription.new(controller: controller, method: method_name, path: route[:path], verb: route[:verb], name: route[:name], dsl_data: dsl_data)
          key = resource_key(resource.controller, resource.method, resource.code)
          @resources[key] = resource
        end
      end

      @resources.each do |_key, resource|
        build_resource_root_ref(resource, :response)
        build_resource_root_ref(resource, :request)
      end
    end

    def swagger_ref_path(name)
      "#/components/schemas/#{name}"
    end

    def swagger_components
      components = {
        schemas: {},
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
          },
        },
      }

      @schemas.each do |name, schema|
        components[:schemas][name] = schema
      end

      components
    end

    def swagger_paths
      # build paths using prebuild schemas and $refs
      paths = {}
      @resources.each do |_key, resource|
        next if resource.private

        paths.deep_merge!(swagger_path_definition(resource))
      end

      paths
    end

    def swagger_path_definition(resource)
      # replace path params like :id with {id} to match swagger spec
      parts = resource.path.split("/")
      params = []
      parts = parts.map do |part|
        if part.start_with?(":")
          params << part[1..-1]
          "{#{part[1..-1]}}"
        else
          part
        end
      end

      verb = resource.verb.downcase

      get_params = []
      request_body = {}

      # for get requests, get the schema properties and append them as query params
      if verb == "get" && (request_schema = @schemas[resource.schema_refs[:request]])
        request_schema[:properties].each do |key, value|
          definition = {
            in: "query",
            name: key,
            required: request_schema[:required]&.include?(key) == true,
            schema: value,
          }

          if value[:description]
            definition[:description] = value[:description]
            value.delete(:description)
          end

          get_params << definition
        end
      elsif verb != "get" && (request_schema_name = resource.schema_refs[:request])
        ref_body = { "$ref": swagger_ref_path(request_schema_name) }
        schema_body = if resource.schema_options[:request][:is_array] == true
          {
            type: "array",
            items: ref_body,
          }
        else
          ref_body
        end

        request_body = {
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: schema_body,
              },
            },
          },
        }
      end

      path_params = params.map do |param|
        {
          in: "path",
          name: param,
          required: true,
          schema: {
            type: :string,
          },
        }
      end

      response = if (response_schema_name = resource.schema_refs[:response])
        ref_body = { "$ref": swagger_ref_path(response_schema_name) }
        schema_body = if resource.schema_options[:response][:is_array] == true
          {
            type: "array",
            items: ref_body,
          }
        else
          ref_body
        end

        description = if resource.schema_options[:response][:description]
          resource.schema_options[:response][:description]
        elsif resource.code == 200
          "Successful operation"
        end

        {
          description: description || "",
          content: {
            "application/json": {
              schema: schema_body,
            },
          },
        }
      end

      {
        parts.join("/") => {
          resource.verb.downcase => {
            parameters: get_params + path_params,
            operationId: resource.base_schema_name,
            summary: resource.summary,
            description: resource.description,
            responses: {
              resource.code => {}.merge(response || {}),
            },
          }.merge(request_body),
        },
      }
    end

    def generate_swagger_json
      build_resources

      # return the final swagger 3.0 json
      {
        openapi: "3.0.0",
        info: {
          title: "Campsite API",
          version: "2.0.0",
          contact: {
            email: "support@campsite.com",
          },
        },
        servers: [
          {
            url: "https://api.campsite.com",
          },
        ],
        paths: swagger_paths,
        components: swagger_components,
      }
    end

    def add_description(controller, method_name, dsl_data)
      @descriptions << [controller, method_name, dsl_data]
    end

    def get_resource_name(klass)
      @controller_to_resource_id ||= {}

      if klass.class == String
        klass
      elsif @controller_to_resource_id.key?(klass)
        @controller_to_resource_id[klass]
      elsif klass.respond_to?(:controller_name)
        return if klass == ActionController::Base

        klass.controller_name
      else
        raise "Can not resolve resource #{klass} name."
      end
    end

    def rails_routes(route_set = nil, base_url = "")
      if route_set.nil? && @rails_routes
        return @rails_routes
      end

      route_set ||= Rails.application.routes
      # ensure routes are loaded
      Rails.application.reload_routes! if Rails.application.routes.routes.empty?

      flatten_routes = []

      route_set.routes.each do |route|
        route_app = route.app.app
        if route_app.respond_to?(:routes) && route_app.routes.is_a?(ActionDispatch::Routing::RouteSet)
          flatten_routes.concat(rails_routes(route_app.routes, File.join(base_url, route.path.spec.to_s)))
        else
          route.base_url = base_url
          flatten_routes << route
        end
      end

      @rails_routes = flatten_routes
    end

    def routes_for_action(controller, method)
      routes = rails_routes.select do |route|
        controller == route_app_controller(route.app, route) &&
          method.to_s == route.defaults[:action]
      end

      format_routes(routes)
    end

    def route_app_controller(app, route, visited_apps = [])
      if route.defaults[:controller]
        controller_name = "#{route.defaults[:controller]}_controller".camelize
        controller_name.safe_constantize
      end
    end

    API_METHODS = ["GET", "POST", "PUT", "PATCH", "OPTIONS", "DELETE"]

    def format_routes(rails_routes)
      rails_routes.map { |rails_route| format_route(rails_route) }
    end

    def format_route(rails_route)
      {
        path: format_path(rails_route),
        verb: format_verb(rails_route),
        name: rails_route.name,
      }
    end

    def format_path(rails_route)
      File.join(rails_route.base_url, rails_route.path.spec.to_s.gsub("(.:format)", ""))
    end

    def format_verb(rails_route)
      verb = API_METHODS.select { |defined_verb| defined_verb =~ /\A#{rails_route.verb}\z/ }
      if verb.count != 1
        verb = API_METHODS.select { |defined_verb| defined_verb == rails_route.constraints[:method] }
        if verb.blank?
          raise "Unknow verb #{rails_route.path.spec}"
        end
      end
      verb.first
    end

    def api_controllers_paths
      Rails.root.glob("app/controllers/api/**/*.rb")
    end

    def load_controller_from_file(controller_file)
      require_dependency controller_file
    end

    def reload
      rails_mark_classes_for_reload

      api_controllers_paths.each do |f|
        load_controller_from_file(f)
      end
    end

    def rails_mark_classes_for_reload
      unless Rails.application.config.cache_classes
        Rails.application.reloader.reload!
        init_env
        Rails.application.reloader.prepare!
      end
    end

    def schema_from_options_or_block(options, &block)
      raise "cannot use both block and model" if !block.nil? && options.key?(:model)

      if options.key?(:model)
        options
      elsif !block.nil?
        # if no model key, make sure type defaults to :object
        { type: :object, properties: block.call }.merge(options)
      else
        { type: :object }.merge(options)
      end
    end
  end
end
