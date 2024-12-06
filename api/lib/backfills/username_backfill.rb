# frozen_string_literal: true

module Backfills
  class UsernameBackfill
    def self.run(dry_run: true)
      updated_count = 0

      User.where(username: nil).find_each do |user|
        update_username(user) unless dry_run

        updated_count += 1
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{updated_count} #{"users".pluralize(updated_count)}"
    end

    def self.update_username(user)
      return if user.username
      return unless user.email

      address = Mail::Address.new(user.email)
      potential = address.local.first(User::USERNAME_LENGTH)
      potential *= 2 if potential.length == 1
      potential = potential.downcase.parameterize.underscore

      # alternative email + [num]
      alts = Array.new(100) { |ix| format("%s%s", potential.first(User::USERNAME_LENGTH - 2), ix + 1) }
      candidates = [potential] + alts
      used = User.where(username: candidates).pluck(:username)
      available = candidates - used - User::RESERVED_NAMES

      user.update_column(:username, available.first)
    rescue Mail::Field::IncompleteParseError
      Rails.logger.debug { "Unable to parse email for user #{user.id}" }
    end
  end
end
