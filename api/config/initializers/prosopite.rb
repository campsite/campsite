# frozen_string_literal: true

# Goal is to enable this in dev and testing
# Prosopite.raise = true
Prosopite.rails_logger = true
Prosopite.allow_stack_paths = ["public_id_generator"]
Prosopite.enabled = !Rails.env.production?
