|      | 0x00       |0x01   |0x02	    0x03	0x04	0x05	0x06	0x07	0x08	0x09	0x0A	0x0B	0x0C	0x0D	0x0E	0x0F
| ---- | ---------- | ----- |
| 0x00 | BRK impl	|ORA X,ind	*	    *	*	ORA zpg	ASL zpg	*	PHP impl	ORA #	ASL A	*	*	ORA abs	ASL abs	*
| 0x10 | BPL rel	|ORA ind,Y	*	    *	*	ORA zpg,X	ASL zpg,X	*	CLC impl	ORA abs,Y	*	*	*	ORA abs,X	ASL abs,X	*
| 0x20 | JSR abs	|AND X,ind	*	    *	BIT zpg	AND zpg	ROL zpg	*	PLP impl	AND #	ROL A	*	BIT abs	AND abs	ROL abs	*
| 0x30 | BMI rel	|AND ind,Y	*	    *	*	AND zpg,X	ROL zpg,X	*	SEC impl	AND abs,Y	*	*	*	AND abs,X	ROL abs,X	*
| 0x40 | RTI impl	|EOR X,ind	*	    *	*	EOR zpg	LSR zpg	*	PHA impl	EOR #	LSR A	*	JMP abs	EOR abs	LSR abs	*
| 0x50 | BVC rel	|EOR ind,Y	*	    *	*	EOR zpg,X	LSR zpg,X	*	CLI impl	EOR abs,Y	*	*	*	EOR abs,X	LSR abs,X	*
| 0x60 | RTS impl	|ADC X,ind	*	    *	*	ADC zpg	ROR zpg	*	PLA impl	ADC #	ROR A	*	JMP ind	ADC abs	ROR abs	*
| 0x70 | BVS rel	|ADC ind,Y	*	    *	*	ADC zpg,X	ROR zpg,X	*	SEI impl	ADC abs,Y	*	*	*	ADC abs,X	ROR abs,X	*
| 0x80 | *	        |STA X,ind	*	    *	STY zpg	STA zpg	STX zpg	*	DEY impl	*	TXA impl	*	STY abs	STA abs	STX abs	*
| 0x90 | BCC rel	|STA ind,Y	*	    *	STY zpg,X	STA zpg,X	STX zpg,Y	*	TYA impl	STA abs,Y	TXS impl	*	*	STA abs,X	*	*
| 0xA0 | LDY #	    |LDA X,ind	LDX #	*	LDY zpg	LDA zpg	LDX zpg	*	TAY impl	LDA #	TAX impl	*	LDY abs	LDA abs	LDX abs	*
| 0xB0 | BCS rel	|LDA ind,Y	*	    *	LDY zpg,X	LDA zpg,X	LDX zpg,Y	*	CLV impl	LDA abs,Y	TSX impl	*	LDY abs,X	LDA abs,X	LDX abs,Y	*
| 0xC0 | CPY #	    |CMP X,ind	*	    *	CPY zpg	CMP zpg	DEC zpg	*	INY impl	CMP #	DEX impl	*	CPY abs	CMP abs	DEC abs	*
| 0xD0 | BNE rel	|CMP ind,Y	*	    *	*	CMP zpg,X	DEC zpg,X	*	CLD impl	CMP abs,Y	*	*	*	CMP abs,X	DEC abs,X	*
| 0xE0 | CPX #	    |SBC X,ind	*	    *	CPX zpg	SBC zpg	INC zpg	*	INX impl	SBC #	NOP impl	*	CPX abs	SBC abs	INC abs	*
| 0xF0 | BEQ rel	|SBC ind,Y	*	    *	*	SBC zpg,X	INC zpg,X	*	SED impl	SBC abs,Y	*	*	*	SBC abs,X	INC abs,X	*
