# frozen_string_literal: true

require "demo_orgs/generator"

namespace :demo_orgs do
  desc "Updates the content of the demo organization without deleting the org or its users"
  task update: [:environment] do
    org = Organization.find_by(slug: DemoOrgs::Generator::ORG_SLUG)
    admin = org.admins.find_by(email: User.dev_user.email)

    DemoOrgs::Generator.new(admin: admin, org: org).update_content
  end
end
