# frozen_string_literal: true

require "csv"

module Backfills
  class RevokeOrganizationFigmaTokensBackfill
    CSV_HEADERS_BY_COLUMN = {
      "users.username" => "Username",
      "users.name" => "Name",
      "users.email" => "Email",
      "oauth_access_tokens.created_at" => "Access token created at",
    }

    def self.run(dry_run: true, organization_slug:)
      organization_user_ids = Organization.find_by!(slug: organization_slug).members.pluck(:id)
      access_tokens = AccessToken
        .joins(:application, :resource_owner)
        .where(resource_owner_id: organization_user_ids, revoked_at: nil, oauth_applications: { provider: :figma })
      report = CSV.generate(headers: true) do |csv|
        csv << CSV_HEADERS_BY_COLUMN.values
        access_tokens.pluck(*CSV_HEADERS_BY_COLUMN.keys).each do |row_data|
          csv << row_data
        end
      end

      access_tokens.find_each do |access_token|
        access_token.revoke unless dry_run
      end

      Rails.logger.info(report)
    end
  end
end
