# frozen_string_literal: true

module ApiSerializerHelpers
  def self.included(base)
    base.extend(SerializerSingletonMethods)
  end

  module SerializerSingletonMethods
    def api_fields
      @api_fields ||= {}
    end

    def api_association_serializers
      @api_associations ||= []
    end
  end
end

class ApiSerializer < Blueprinter::Base
  include ApiSerializerHelpers

  class Association
    def initialize(name:, serializer:, skip:)
      @name = name
      @serializer = serializer
      @skip = skip
    end

    attr_reader :name, :serializer, :skip
  end

  def self.schema_description
    api_fields
  end

  def self._add_api_field(name, view, options)
    required = options[:required]
    required = required.nil? ? view.nil? && options[:if].nil? && options[:unless].nil? : required
    api_fields[options.fetch(:name, name)] = {
      type: options.fetch(:type, :string),
      is_array: options[:is_array] == true,
      required: required,
      nullable: options[:nullable] == true,
      model: options[:model] || options[:blueprint],
      properties: options[:properties],
      additional_properties: options[:additional_properties],
      enum: options[:enum],
    }
  end

  def self.api_field(name, options = {}, &block)
    view = options.dig(:view)

    _add_api_field(name, view, options)

    if view
      self.view(view) do
        field(name, options, &block)
      end
    else
      field(name, options, &block)
    end
  end

  def self.api_association(name, options = {}, &block)
    view = options.dig(:view)
    options = options.merge(view: options.dig(:assoc_view))

    _add_api_field(name, view, options)

    if view
      self.view(view) do
        association(name, options, &block)
      end
    else
      association(name, options, &block)
    end

    api_association_serializers << Association.new(
      name: name,
      serializer: options[:blueprint],
      # skip over associations with blocks since name wont map to a known association
      skip: !block.nil?,
    )
  end

  def self.api_page(data_serializer, options = {}, &block)
    api_field(:next_cursor, { required: false, nullable: true })
    api_field(:prev_cursor, { required: false, nullable: true })
    api_association(:results, options.merge({ blueprint: data_serializer, name: :data, is_array: true, required: true }), &block)
  end

  def self.api_normalize(name)
    api_field(:type_name) { name }
  end

  def self.run_preloads(root, options)
    gather = {}
    _gather_preloads(root, gather)
    gather.each do |serializer, items|
      key = serializer.preload_options_key
      options[key] ||= {}
      options[key].deep_merge!(serializer.preload(items.uniq, options))
    end

    options
  end

  def self._gather_preloads(root, gather = {})
    root = [root] unless root.is_a?(Array) && root != []
    root = root.flatten.compact

    return if root.none?

    if respond_to?(:preload)
      gather[self] ||= []
      gather[self] += root
    end

    api_association_serializers.each do |assoc|
      associations = root.map do |item|
        if assoc.skip
          nil
        elsif item.is_a?(Hash)
          item[assoc.name]
        else
          item.public_send(assoc.name)
        end
      end

      assoc.serializer._gather_preloads(associations, gather)
    end
  end

  def self.preloads(options, key, *dig_path)
    result = options.dig(preload_options_key, key)
    value = result.is_a?(AsyncPreloader) ? result.value : result
    if dig_path.any?
      value&.dig(*dig_path)
    else
      value
    end
  end

  def self.preload_options_key
    to_s
  end

  def self.preload_and_render(resource, user: nil, member: nil, organization: nil, url: nil, options: {})
    options = {
      user: user,
      member: member,
      organization: organization,
      url: url,
    }.merge(options)

    run_preloads(resource, options)

    render(resource, options)
  end
end
