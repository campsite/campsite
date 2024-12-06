# frozen_string_literal: true

module Integrations
  class LinearOrganization
    attr_reader :campsite_org_id

    class LinearOrganizationError < StandardError; end

    def initialize(campsite_org_id)
      @campsite_org_id = campsite_org_id
    end

    def id
      linear_organization["id"]
    end

    private

    def linear_organization
      @linear_organization ||= fetch_organization!
    end

    def fetch_organization!
      query = <<~GRAPHQL
        query {
          organization {
            id
          }
        }
      GRAPHQL

      response = linear_client.send(JSON[{ "query" => query }]).body

      if (linear_organization = response.dig("data", "organization"))
        linear_organization
      else
        raise LinearOrganizationError, "Could not find Linear organization id for Campsite organization id #{campsite_org_id}"
      end
    end

    def linear_client
      return @linear_client if defined? @linear_client

      org = Organization.find_by(id: campsite_org_id)
      token = org.linear_integration&.token
      @linear_client ||= LinearClient.new(token)
    end
  end
end
