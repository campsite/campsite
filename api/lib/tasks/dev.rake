# frozen_string_literal: true

require "json"
require "readline"

namespace :dev do
  task setup_sso_user: [:environment] do
    puts "What's your Campsite email address?"
    email = gets.chomp
    puts ""

    puts "What's your first name?"
    first_name = gets.chomp
    puts ""

    puts "What's your last name?"
    last_name = gets.chomp
    puts ""

    password = "CampsiteDesign!"

    user = User.find_or_initialize_by(email: email)
    user.update!(
      name: "#{first_name} #{last_name}",
      username: "#{first_name.downcase}#{last_name.downcase}",
      password: password,
      password_confirmation: password,
    )
    user.skip_confirmation!
    user.save!
    Organization.find_by(slug: "campsite").create_membership!(user: user, role_name: :admin)

    puts "✅ Created Campsite user #{email} with password #{password}."
    puts ""

    puts "Sign up for Auth0 at https://auth0.com/signup. Visit https://manage.auth0.com/#/apis/management/explorer and follow the instructions to create and authorize a test application."
    puts "What's your Auth0 API token?"
    # gets maxes out at 1024 characters, so have to use Readline for > 4,000 character API token
    token = Readline.readline.chomp
    puts ""

    puts "Your Auth0 identifier is a URL near the top of https://manage.auth0.com/#/apis/management/explorer that looks like https://dev-rollyjs0c8wx2k0b.us.auth0.com/api/v2/"
    puts "What's your Auth0 identifier?"
    identifier = gets.chomp
    puts ""

    response = Faraday.post(
      "#{identifier}users",
      {
        "email" => email,
        "email_verified" => true,
        "password" => password,
        "given_name" => first_name,
        "family_name" => last_name,
        "name" => "#{first_name} #{last_name}",
        "connection" => "Username-Password-Authentication",
      }.to_json,
      {
        "authorization" => "Bearer #{token}",
        "cache-control" => "no-cache",
        "content-type" => "application/json",
      },
    )

    if response.status == 201
      puts "✅ Created Auth0 user #{email} with password #{password}."
    else
      puts "❌ Failed to create Auth0 user"
      puts response.body
    end

    Flipper.enable(:organization_sso)
    puts "✅ Globally enabled the organization_sso feature flag."
  end

  task change_plan: [:environment] do
    puts "What's the organization's slug?"
    slug = gets.chomp
    puts ""

    puts "What's the new plan? (#{Plan::NAMES.join(", ")})"
    plan_name = gets.chomp
    puts ""

    org = Organization.find_by!(slug: slug)
    org.update!(plan_name: plan_name)

    puts "✅ Updated #{slug} to #{plan_name}."
  end
end
