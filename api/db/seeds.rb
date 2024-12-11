# frozen_string_literal: true

# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
if Rails.env.development?
  # Create development Zapier app. This maps to the `Campsite (Dev)` app in our Zapier account.
  OauthApplication.create(
    name: "Zapier",
    provider: :zapier,
    avatar_path: "static/avatars/service-zapier.png",
    redirect_uri: Rails.application.credentials.zapier.redirect_uri, 
    confidential: true, 
    scopes: "read_organization write_organization",
    uid: Rails.application.credentials.zapier.client_id,
    secret: Doorkeeper.config.application_secret_strategy.transform_secret(Rails.application.credentials.zapier.client_secret),
  )

  OauthApplication.create(
    name: "Cal.com",
    provider: :cal_dot_com,
    avatar_path: "static/avatars/service-cal-dot-com.png",
    redirect_uri: Rails.application.credentials.cal_dot_com.redirect_uri, 
    confidential: true, 
    uid: Rails.application.credentials.cal_dot_com.client_id,
    secret: Doorkeeper.config.application_secret_strategy.transform_secret(Rails.application.credentials.cal_dot_com.client_secret),
  )

  # Set up the default dev org
  generator = DemoOrgs::Generator.new
  generator.update_content

  admin_member = generator.admin_membership
  admin_user = admin_member.user

  # Make Rick "staff" (a private Campsite property - allows admin access, among other things)
  admin_user.update!(staff: true)
  
  # Create an empty organization
  alt_org = Organization.create_organization(creator: admin_user, name: "Deserted Dunes", slug: "deserted-dunes")
  alt_org.create_membership!(user: admin_user, role_name: :admin)

  OauthApplication.create(
    name: "figma-plugin",
    provider: :figma,
    redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
    confidential: true,
    owner: admin_user,
    scopes: "read_organization write_post write_project"
  )
end
