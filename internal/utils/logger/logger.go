package logger

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

type Fields map[string]interface{}

type Logger struct {
	requestID string
	fields    Fields
}

func New(requestID string) *Logger {
	return &Logger{
		requestID: requestID,
		fields:    make(Fields),
	}
}

func FromContext(ctx context.Context) *Logger {
	if requestID, ok := ctx.Value("request_id").(string); ok {
		return New(requestID)
	}
	return New("")
}

func FromGin(c *gin.Context) *Logger {
	requestID := ""
	if id, exists := c.Get("request_id"); exists {
		if str, ok := id.(string); ok {
			requestID = str
		}
	}
	return New(requestID)
}

func (l *Logger) WithField(key string, value interface{}) *Logger {
	newLogger := *l
	if newLogger.fields == nil {
		newLogger.fields = make(Fields)
	}
	newLogger.fields[key] = value
	return &newLogger
}

func (l *Logger) WithFields(fields Fields) *Logger {
	newLogger := *l
	if newLogger.fields == nil {
		newLogger.fields = make(Fields)
	}
	for k, v := range fields {
		newLogger.fields[k] = v
	}
	return &newLogger
}

func (l *Logger) Info(msg string) {
	l.log("INFO", msg)
}

func (l *Logger) Infof(format string, args ...interface{}) {
	l.logf("INFO", format, args...)
}

func (l *Logger) Error(msg string) {
	l.log("ERROR", msg)
}

func (l *Logger) Errorf(format string, args ...interface{}) {
	l.logf("ERROR", format, args...)
}

func (l *Logger) Warn(msg string) {
	l.log("WARN", msg)
}

func (l *Logger) Warnf(format string, args ...interface{}) {
	l.logf("WARN", format, args...)
}

func (l *Logger) Debug(msg string) {
	l.log("DEBUG", msg)
}

func (l *Logger) Debugf(format string, args ...interface{}) {
	l.logf("DEBUG", format, args...)
}

func (l *Logger) log(level, msg string) {
	prefix := time.Now().Format(time.RFC3339)
	if l.requestID != "" {
		prefix += " request_id=" + l.requestID
	}
	for k, v := range l.fields {
		prefix += " " + k + "=" + fmt.Sprintf("%v", v)
	}
	log.Printf("%s [%s] %s", prefix, level, msg)
}

func (l *Logger) logf(level, format string, args ...interface{}) {
	l.log(level, fmt.Sprintf(format, args...))
}

func Init(level string) {
	switch level {
	case "debug":
		log.SetPrefix("[DEBUG] ")
	case "info":
		log.SetPrefix("[INFO] ")
	case "warn":
		log.SetPrefix("[WARN] ")
	case "error":
		log.SetPrefix("[ERROR] ")
	default:
		log.SetPrefix("[INFO] ")
	}
}

func SetupGlobalLogger() {
	log.SetOutput(os.Stdout)
	log.SetFlags(log.LstdFlags | log.Lshortfile)
}
