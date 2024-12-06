# frozen_string_literal: true

module Admin
  module Features
    class NullUser < NullActor
      def model
        User
      end

      def email
        "#{flipper_id} (deleted)"
      end
    end
  end
end
