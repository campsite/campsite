# frozen_string_literal: true

module Admin
  module Features
    class NullActor
      def self.build(model:, id:)
        if model == User
          NullUser.new(id: id)
        elsif model == Organization
          NullOrganization.new(id: id)
        else
          raise "missing null object for #{model}"
        end
      end

      def initialize(id:)
        @id = id
      end

      attr_reader :id

      def is_a?(klass)
        klass == model || super
      end

      def flipper_id
        "#{model};#{id}"
      end
    end
  end
end
