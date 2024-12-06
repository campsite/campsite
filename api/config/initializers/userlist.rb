# frozen_string_literal: true

# Disabled since Userlist isn't setup in the public version
# Userlist.configure do |config|
#   config.auto_discover = false
#   config.push_key = Rails.application.credentials&.userlist&.push_key
#   config.push_id = Rails.application.credentials&.userlist&.push_id
#   config.user_model = "User"
#   config.company_model = "Organization"
#   config.relationship_model = "OrganizationMembership"
#   config.push_strategy = :sidekiq # Rails.env.production? ? :sidekiq : :null
#   config.push_strategy_options = { queue: :background }
# end
