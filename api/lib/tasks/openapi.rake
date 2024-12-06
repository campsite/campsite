# frozen_string_literal: true

# This file produces an OpenAPI schema for our public API.
# It does so by filtering "/v2"-prefixed paths, and then recursively finding all referenced schemas.

# The process involves several steps:
# 1. Reads the API's Swagger schema file
# 2. Filters paths to include only those starting with "/v2"
# 3. Collects schemas directly referenced in the filtered paths
# 4. Recursively collects nested schemas from step 3
# 5. Adds custom metadata to the schema
require "openapi3_parser"

namespace :openapi do
  task generate_json: [:environment] do |_t|
    out = ENV["OUT"] || Rails.root.join("gen/schema_openapi.json")

    @schema = JSON.parse(File.read(Rails.root.join("gen/schema_swagger.json").to_s))
    @schema_keys = Set.new

    filter_paths
    filter_schemas
    add_metadata
    fix_nullable_refs

    generate_json_file(out)
    validate_schema(out)
  end

  def generate_json_file(out)
    json_str = JSON.pretty_generate(@schema)

    path = Pathname.new(out)
    File.open(path, "w") { |file| file.write(json_str) }

    path
  end

  def validate_schema(out)
    document = Openapi3Parser.load_file(out)

    unless document.valid?
      puts "🚨 WARNING: OpenAPI schema validation failed"
      document.errors.each do |error|
        puts "  - #{error.message}"
      end
    end
  end

  def filter_paths
    @schema["paths"] = @schema["paths"].select { |key, _| key.start_with?("/v2") }
  end

  def filter_schemas
    collect_schemas_from_paths
    collect_schemas_from_components

    @schema["components"]["schemas"] = @schema["components"]["schemas"].select do |key, _|
      @schema_keys.include?(key)
    end
  end

  def add_metadata
    @schema["info"]["description"] = <<~HTML
      This is the internal documentation for our public REST API. Use this as a starting point for hacking on projects. We'll build a proper documentation site later.

      ⚠️  This API is a work in progress! Field and endpoint names are subject to change, and not all endpoints have been added yet.
    HTML

    @schema["security"] = [{ "bearerAuth" => [] }]
  end

  def collect_schemas_from_paths
    @schema["paths"].each do |_, path_item|
      path_item.each do |_, operation|
        collect_schemas_from_operation(operation)
      end
    end
  end

  def collect_schemas_from_components
    # get the initial set of keys found in /v2 paths
    components = @schema["components"]["schemas"].select do |key, _|
      @schema_keys.include?(key)
    end

    # recursively collect all referenced schemas
    components.each do |_, schema|
      collect_component_schema_refs(schema)
    end
  end

  def collect_schemas_from_operation(operation)
    if operation["requestBody"]
      collect_schema_refs(operation["requestBody"]["content"])
    end

    operation["responses"]&.each do |_, response|
      if response["content"]
        collect_schema_refs(response["content"])
      elsif response["schema"]
        collect_schema_ref(response["schema"])
      end
    end
  end

  def collect_schema_refs(content)
    content&.each do |_, media_type|
      collect_schema_ref(media_type["schema"])
    end
  end

  def collect_component_schema_refs(schema)
    schema["properties"].each_value do |prop|
      collect_schema_ref(prop)
    end

    if schema["items"]
      collect_schema_ref(schema.items)
    end
  end

  def collect_schema_ref(schema)
    if schema
      if schema["$ref"]
        key = schema["$ref"].split("/").last
        @schema_keys << key
        collect_schema_ref(@schema["components"]["schemas"][key])
      elsif schema["nullable"] && schema["oneOf"]
        ref_keys = schema["oneOf"].filter_map { |s| s["$ref"] }.map { |ref| ref.split("/").last }
        ref_keys.each do |key|
          @schema_keys << key
          collect_schema_ref(@schema["components"]["schemas"][key])
        end
      elsif schema["type"] == "array" && schema["items"]
        collect_schema_ref(schema["items"])
      elsif schema["properties"]
        schema["properties"].each_value do |prop|
          collect_schema_ref(prop)
        end
      end
    end
  end

  # the OpenAPI validator doesn't support nullable + $ref
  # so we need to convert to nullable + oneOf
  def fix_nullable_refs
    @schema["components"]["schemas"].each do |_, schema|
      schema["properties"].each do |_, prop|
        next unless prop["nullable"] && prop["$ref"]

        prop["oneOf"] = [{ "$ref": prop["$ref"] }]
        prop.delete("$ref")
      end
    end
  end
end
