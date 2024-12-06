# frozen_string_literal: true

module Apigen
  def self.app
    @app ||= Apigen::Application.new
  end
end
