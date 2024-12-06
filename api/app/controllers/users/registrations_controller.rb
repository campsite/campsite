# frozen_string_literal: true

module Users
  class RegistrationsController < Devise::RegistrationsController
    def create
      super do |user|
        unless user.valid?
          return render(:new)
        end
      end
    end

    private

    def build_resource(hash = {})
      hash[:referrer] = cookies[:referrer]
      hash[:landing_url] = cookies[:landing_url]
      super(hash)
    end

    # copied from devise gem, the devise gem wipes the redirect session key
    # after sign up but in our scenario we would like to maintain that key
    # till after the user confirms their email so they can still end up
    # on eg. a campsite invitation page. We will wipe this key on logout.
    def stored_location_for(resource_or_scope)
      session_key = stored_location_key_for(resource_or_scope)
      session[session_key]
    end
  end
end
