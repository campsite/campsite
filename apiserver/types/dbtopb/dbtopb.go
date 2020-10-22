package dbtopb

import (
	"campsite.social/campsite/apiserver/db"
)

func directionToByte(dir db.PageDirection) byte {
	switch dir {
	case db.PageDirectionNewer:
		return 1
	case db.PageDirectionOlder:
		return 2
	default:
		return 0
	}
}

func byteToDirection(dir byte) db.PageDirection {
	switch dir {
	case 1:
		return db.PageDirectionNewer
	case 2:
		return db.PageDirectionOlder
	default:
		return 0
	}
}
