# frozen_string_literal: true

require "test_helper"

module Integrations
  module Linear
    class SetOrganizationIdTest < ActiveJob::TestCase
      setup do
        @integration = create(:integration, :linear)
        @organization = @integration.owner
      end

      context "#perform" do
        test "sets the organization id on the linear integration" do
          assert_nil @integration.data.find_by(name: IntegrationData::ORGANIZATION_ID)&.value

          VCR.use_cassette("linear/organization") do
            Integrations::Linear::SetOrganizationIdJob.new.perform(@organization.id)
          end

          assert_not_nil @integration.data.find_by(name: IntegrationData::ORGANIZATION_ID)&.value
        end
      end
    end
  end
end
