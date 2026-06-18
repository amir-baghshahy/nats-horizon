package utils

import (
	"fmt"
	"regexp"
)

// natsNameRe matches valid NATS stream/consumer names: alphanumeric, hyphens, underscores only.
// Dots, wildcards (* >), and spaces are rejected because they would fragment or mis-target subjects.
var natsNameRe = regexp.MustCompile(`^[A-Za-z0-9_-]+$`)

// ValidateNATSName returns an error if name is empty or contains characters that
// would allow subject injection when embedded in a NATS subject string.
func ValidateNATSName(label, name string) error {
	if name == "" {
		return fmt.Errorf("%s must not be empty", label)
	}
	if !natsNameRe.MatchString(name) {
		return fmt.Errorf("%s %q contains invalid characters (only A-Z, a-z, 0-9, - and _ are allowed)", label, name)
	}
	return nil
}
