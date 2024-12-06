# frozen_string_literal: true

module Integrations
  module Linear
    class SetOrganizationIdJob < BaseJob
      attr_reader :campsite_organization_id

      sidekiq_options queue: "background"

      def perform(campsite_organization_id)
        @campsite_organization_id = campsite_organization_id

        linear_org_id = linear_organization.id
        linear_integration.find_or_initialize_data(IntegrationData::ORGANIZATION_ID).update!(value: linear_org_id)
      end

      private

      def linear_integration
        @linear_integration ||= campsite_organization.linear_integration
      end

      def campsite_organization
        @campsite_organization ||= Organization.find(campsite_organization_id)
      end

      def linear_organization
        @linear_organization ||= Integrations::LinearOrganization.new(campsite_organization_id)
      end
    end
  end
end
