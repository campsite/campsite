# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Zapier
        class CallbacksController < BaseController
          before_action :authenticate

          def show
            render(json: {
              # Zapier uses this to label the connection after it's created and tested
              organization_name: integration.owner.name,
            })
          end
        end
      end
    end
  end
end
