# -*- coding: utf-8 -*-

# frozen_string_literal: true

require_relative "../../config/boot"
require "apigen"

namespace :apigen do
  task generate_json: [:environment] do |_t, args|
    with_loaded_documentation do
      out = ENV["OUT"] || Rails.root.join("gen")
      _generate_swagger_using_args(args, out)
    end
  end

  def _generate_swagger_using_args(args, out)
    doc = Apigen.app.generate_swagger_json
    _generate_swagger_json_page(out, doc)
  end

  def _generate_swagger_json_page(file_base, doc)
    FileUtils.mkdir_p(file_base) unless File.exist?(file_base)

    path = Pathname.new("#{file_base}/schema_swagger.json")
    File.open(path, "w") { |file| file.write(JSON.pretty_generate(doc)) }

    path
  end

  def with_loaded_documentation
    Apigen.app.reload
    yield
  end
end
