# frozen_string_literal: true

module Admin
  module Features
    class NullOrganization < NullActor
      def model
        Organization
      end

      def name
        "#{flipper_id} (deleted)"
      end
    end
  end
end
